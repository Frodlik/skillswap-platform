package com.skillswap.authservice.dto.response;

import java.util.UUID;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,  // access token TTL in seconds
        UUID userId,
        String role
) {}