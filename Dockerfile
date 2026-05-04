# syntax=docker/dockerfile:1.7
#
# Single Dockerfile shared by all 7 SkillSwap modules.
# Build the desired service via:
#   docker build --build-arg SERVICE=auth-service -t skillswap/auth-service .
# Or via docker-compose.yml — see `services.<svc>.build.args.SERVICE`.

ARG MAVEN_IMAGE=maven:3.9-eclipse-temurin-21
ARG JRE_IMAGE=eclipse-temurin:21-jre-alpine

# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: build
# ──────────────────────────────────────────────────────────────────────────────
FROM ${MAVEN_IMAGE} AS build
ARG SERVICE
WORKDIR /workspace

# Copy parent + module poms first so Maven dep resolution caches across rebuilds
# whenever only Java source changes.
COPY pom.xml ./
COPY eureka-server/pom.xml         eureka-server/
COPY api-gateway/pom.xml           api-gateway/
COPY auth-service/pom.xml          auth-service/
COPY user-service/pom.xml          user-service/
COPY skill-service/pom.xml         skill-service/
COPY matching-service/pom.xml      matching-service/
COPY session-service/pom.xml       session-service/
COPY notification-service/pom.xml  notification-service/

# Pre-fetch dependencies. `|| true` because go-offline is best-effort under
# multi-module reactors and may report errors that don't affect the package step.
RUN mvn -B -pl "${SERVICE}" -am dependency:go-offline -DskipTests || true

# Copy source for every module (Maven multi-module needs sibling modules
# resolvable on disk when -am is used).
COPY eureka-server/src         eureka-server/src
COPY api-gateway/src           api-gateway/src
COPY auth-service/src          auth-service/src
COPY user-service/src          user-service/src
COPY skill-service/src         skill-service/src
COPY matching-service/src      matching-service/src
COPY session-service/src       session-service/src
COPY notification-service/src  notification-service/src

RUN mvn -B -pl "${SERVICE}" -am package -DskipTests \
    && cp "${SERVICE}/target/"*.jar /workspace/app.jar

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: runtime
# ──────────────────────────────────────────────────────────────────────────────
FROM ${JRE_IMAGE} AS runtime
WORKDIR /app

# busybox-wget (alpine default) is sufficient for actuator healthcheck.
COPY --from=build /workspace/app.jar app.jar

# Drop privileges
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
