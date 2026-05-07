package com.skillswap.moderationservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Component
@Order(1)
public class ModerationRoleFilter extends OncePerRequestFilter {

    private static final Set<String> ALLOWED = Set.of("MODERATOR", "ADMIN");
    private final ObjectMapper objectMapper;

    public ModerationRoleFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain) throws ServletException, IOException {
        String role = request.getHeader("x-user-role");
        if (!ALLOWED.contains(role)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            objectMapper.writeValue(response.getWriter(), Map.of(
                    "status", 403,
                    "message", "Moderator or Admin role required",
                    "path", request.getRequestURI(),
                    "timestamp", Instant.now().toString()
            ));
            return;
        }
        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/actuator") || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/swagger-ui");
    }
}
