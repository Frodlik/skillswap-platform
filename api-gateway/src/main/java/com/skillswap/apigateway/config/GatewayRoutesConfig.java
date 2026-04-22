package com.skillswap.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;

import static org.springframework.cloud.gateway.server.mvc.filter.CircuitBreakerFilterFunctions.circuitBreaker;
import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.web.servlet.function.RequestPredicates.path;
import static org.springframework.web.servlet.function.RouterFunctions.route;

@Configuration
class GatewayRoutesConfig {

    @Bean
    RouterFunction<ServerResponse> authServiceRoute() {
        return route(path("/api/v1/auth/**"), http())
                .filter(lb("auth-service"))
                .filter(circuitBreaker("auth-service", URI.create("forward:/fallback/auth")));
    }

    @Bean
    RouterFunction<ServerResponse> userServiceRoute() {
        return route(path("/api/v1/users/**"), http())
                .filter(lb("user-service"))
                .filter(circuitBreaker("user-service", URI.create("forward:/fallback/user")));
    }

    @Bean
    RouterFunction<ServerResponse> skillServiceRoute() {
        return route(path("/api/v1/skills/**"), http())
                .filter(lb("skill-service"))
                .filter(circuitBreaker("skill-service", URI.create("forward:/fallback/skill")));
    }

    @Bean
    RouterFunction<ServerResponse> matchingServiceRoute() {
        return route(path("/api/v1/matches/**"), http())
                .filter(lb("matching-service"))
                .filter(circuitBreaker("matching-service", URI.create("forward:/fallback/matching")));
    }

    @Bean
    RouterFunction<ServerResponse> sessionServiceRoute() {
        return route(path("/api/v1/sessions/**"), http())
                .filter(lb("session-service"))
                .filter(circuitBreaker("session-service", URI.create("forward:/fallback/session")));
    }
}
