package com.skillswap.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rate-limit")
public record RateLimitProperties(
        int authRequestsPerMinute,
        int apiRequestsPerMinute) {}
