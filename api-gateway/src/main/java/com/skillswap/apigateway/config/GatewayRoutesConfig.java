package com.skillswap.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.setPath;
import static org.springframework.cloud.gateway.server.mvc.filter.CircuitBreakerFilterFunctions.circuitBreaker;
import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.web.servlet.function.RequestPredicates.path;

@Configuration
class GatewayRoutesConfig {

    @Bean
    RouterFunction<ServerResponse> authServiceRoute() {
        return route("auth-service")
                .route(path("/api/v1/auth/**"), http())
                .filter(lb("auth-service"))
                .filter(circuitBreaker("auth-service", URI.create("forward:/fallback/auth")))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> userServiceRoute() {
        return route("user-service")
                .route(path("/api/v1/users/**"), http())
                .filter(lb("user-service"))
                .filter(circuitBreaker("user-service", URI.create("forward:/fallback/user")))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> skillServiceRoute() {
        return route("skill-service")
                .route(path("/api/v1/skills/**"), http())
                .filter(lb("skill-service"))
                .filter(circuitBreaker("skill-service", URI.create("forward:/fallback/skill")))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> matchingServiceRoute() {
        return route("matching-service")
                .route(path("/api/v1/matches/**"), http())
                .filter(lb("matching-service"))
                .filter(circuitBreaker("matching-service", URI.create("forward:/fallback/matching")))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> sessionServiceRoute() {
        return route("session-service")
                .route(path("/api/v1/sessions/**"), http())
                .filter(lb("session-service"))
                .filter(circuitBreaker("session-service", URI.create("forward:/fallback/session")))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> moderationServiceRoute() {
        return route("moderation-service")
                .route(path("/api/v1/moderation/**"), http())
                .filter(lb("moderation-service"))
                .filter(circuitBreaker("moderation-service", URI.create("forward:/fallback/moderation")))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> authDocsRoute() {
        return route("auth-docs")
                .route(path("/api-docs/auth"), http())
                .before(setPath("/v3/api-docs"))
                .filter(lb("auth-service"))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> userDocsRoute() {
        return route("user-docs")
                .route(path("/api-docs/user"), http())
                .before(setPath("/v3/api-docs"))
                .filter(lb("user-service"))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> skillDocsRoute() {
        return route("skill-docs")
                .route(path("/api-docs/skill"), http())
                .before(setPath("/v3/api-docs"))
                .filter(lb("skill-service"))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> matchingDocsRoute() {
        return route("matching-docs")
                .route(path("/api-docs/matching"), http())
                .before(setPath("/v3/api-docs"))
                .filter(lb("matching-service"))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> sessionDocsRoute() {
        return route("session-docs")
                .route(path("/api-docs/session"), http())
                .before(setPath("/v3/api-docs"))
                .filter(lb("session-service"))
                .build();
    }
}
