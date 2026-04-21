package com.skillswap.apigateway.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(2)
class JwtAuthenticationFilter extends OncePerRequestFilter {

    // TODO: implement after Auth Service exposes JWKS endpoint
    //
    // 1. Add to pom.xml:
    //      spring-boot-starter-oauth2-resource-server
    //
    // 2. Add to application.yml:
    //      spring.security.oauth2.resourceserver.jwt.jwk-set-uri:
    //        http://${AUTH_SERVICE_HOST:localhost}:${AUTH_SERVICE_PORT:8081}/api/v1/auth/.well-known/jwks.json
    //
    // 3. Replace doFilterInternal body with:
    //    a. Extract "Authorization: Bearer <token>" header; return 401 if missing (skip public paths)
    //    b. Validate RS256 signature via JwtDecoder bean (auto-configured by oauth2-resource-server)
    //    c. Populate SecurityContextHolder with JwtAuthenticationToken
    //    d. Public paths that skip validation: /api/v1/auth/**, /actuator/health, /actuator/info
    //
    // 4. Return 401 response body format:
    //    {"status":401,"message":"Unauthorized","path":"<uri>","timestamp":"<iso>"}

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        chain.doFilter(request, response);
    }
}
