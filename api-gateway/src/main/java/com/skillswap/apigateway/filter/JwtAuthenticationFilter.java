package com.skillswap.apigateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.apigateway.config.JwtProperties;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.*;

@Component
@Order(2)
class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final RSAPublicKey publicKey;
    private final ObjectMapper objectMapper;
    private final List<String> publicPaths;

    JwtAuthenticationFilter(RSAPublicKey jwtPublicKey, ObjectMapper objectMapper, JwtProperties jwtProperties) {
        this.publicKey = jwtPublicKey;
        this.objectMapper = objectMapper;
        this.publicPaths = jwtProperties.publicPaths();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String uri = request.getRequestURI();

        if (isPublicPath(uri)) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null) {
            sendUnauthorized(response, uri, "Missing Authorization header");
            return;
        }
        if (!header.startsWith("Bearer ")) {
            sendUnauthorized(response, uri, "Invalid Authorization scheme");
            return;
        }

        try {
            var claims = Jwts.parser()
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(header.substring(7))
                    .getPayload();

            String userId = claims.getSubject();
            String role = Objects.requireNonNullElse(claims.get("role", String.class), "");
            chain.doFilter(new HeaderEnrichingRequestWrapper(request, userId, role), response);
        } catch (JwtException e) {
            sendUnauthorized(response, uri, "Invalid or expired token");
        }
    }

    private boolean isPublicPath(String uri) {
        return publicPaths.stream().anyMatch(pattern -> pattern.endsWith("/**")
                ? uri.startsWith(pattern.substring(0, pattern.length() - 2))
                : uri.equals(pattern));
    }

    private void sendUnauthorized(HttpServletResponse response, String path, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(), Map.of(
                "status", 401,
                "message", message,
                "path", path,
                "timestamp", Instant.now().toString()
        ));
    }

    private static class HeaderEnrichingRequestWrapper extends HttpServletRequestWrapper {
        private final Map<String, String> extra;

        HeaderEnrichingRequestWrapper(HttpServletRequest request, String userId, String role) {
            super(request);
            this.extra = Map.of("X-User-Id", userId, "X-User-Role", role);
        }

        @Override
        public String getHeader(String name) {
            return extra.getOrDefault(name, super.getHeader(name));
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (extra.containsKey(name)) {
                return Collections.enumeration(List.of(extra.get(name)));
            }
            return super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            var names = new LinkedHashSet<>(Collections.list(super.getHeaderNames()));
            names.addAll(extra.keySet());
            return Collections.enumeration(names);
        }
    }
}