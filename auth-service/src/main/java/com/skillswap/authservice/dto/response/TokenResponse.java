package com.skillswap.authservice.dto.response;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        long expiresIn   // access token TTL in seconds
) {}