package com.skillswap.moderationservice.dto.response;

import com.skillswap.moderationservice.domain.SanctionType;
import java.time.Instant;
import java.util.UUID;

public record SanctionResponse(
        UUID id,
        UUID userId,
        SanctionType type,
        String reason,
        Instant expiresAt,
        UUID createdBy,
        Instant createdAt,
        Instant liftedAt,
        UUID liftedBy
) {}
