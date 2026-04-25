package com.skillswap.sessionservice.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID sessionId,
        UUID reviewerId,
        UUID revieweeId,
        int rating,
        String comment,
        Instant createdAt
) {}
