package com.skillswap.matchingservice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Matching Service API",
                version = "v1",
                description = "Pre-computed P2P match suggestions, accept/decline flow, and weighted score breakdown."),
        servers = {
                @Server(url = "http://localhost:8080", description = "Gateway"),
                @Server(url = "http://localhost:8084", description = "Direct")
        })
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT")
public class OpenApiConfig {
}
