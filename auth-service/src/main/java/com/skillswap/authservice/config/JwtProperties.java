package com.skillswap.authservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;

import java.time.Duration;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
        Resource privateKey,
        Resource publicKey,
        Duration accessTokenExpiry,
        Duration refreshTokenExpiry
) {}