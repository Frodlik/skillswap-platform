package com.skillswap.userservice.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        UUID userId,
        String displayName,
        String bio,
        String avatarUrl,
        String timezone,
        String language,
        String location,
        BigDecimal rating,
        Instant createdAt,
        Instant updatedAt
) {}
