package com.skillswap.apigateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.skillswap.apigateway.config.RateLimitProperties;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
@Order(1)
class RateLimitFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> authBuckets;
    private final Cache<String, Bucket> apiBuckets;
    private final Bandwidth authLimit;
    private final Bandwidth apiLimit;
    private final ObjectMapper objectMapper;

    RateLimitFilter(RateLimitProperties props, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.authLimit = Bandwidth.builder()
                .capacity(props.authRequestsPerMinute())
                .refillGreedy(props.authRequestsPerMinute(), Duration.ofMinutes(1))
                .build();
        this.apiLimit = Bandwidth.builder()
                .capacity(props.apiRequestsPerMinute())
                .refillGreedy(props.apiRequestsPerMinute(), Duration.ofMinutes(1))
                .build();
        this.authBuckets = newCache();
        this.apiBuckets = newCache();
    }

    private static Cache<String, Bucket> newCache() {
        return Caffeine.newBuilder()
                .expireAfterAccess(2, TimeUnit.MINUTES)
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String ip = resolveClientIp(request);
        String uri = request.getRequestURI();

        boolean isAuthPath = uri.startsWith("/api/v1/auth/");
        Bandwidth limit = isAuthPath ? authLimit : apiLimit;
        Cache<String, Bucket> cache = isAuthPath ? authBuckets : apiBuckets;

        Bucket bucket = cache.get(ip, k -> Bucket.builder().addLimit(limit).build());
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            chain.doFilter(request, response);
        } else {
            long retryAfterSeconds = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill());
            sendTooManyRequests(response, uri, retryAfterSeconds);
        }
    }

    private static String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendTooManyRequests(HttpServletResponse response,
                                     String path,
                                     long retryAfterSeconds) throws IOException {
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(), Map.of(
                "status", 429,
                "message", "Too many requests. Please slow down.",
                "path", path,
                "timestamp", Instant.now().toString()
        ));
    }
}
