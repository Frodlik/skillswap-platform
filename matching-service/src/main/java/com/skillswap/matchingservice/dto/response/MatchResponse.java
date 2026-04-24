package com.skillswap.matchingservice.dto.response;

import java.time.Instant;
import java.util.UUID;

public record MatchResponse(
        UUID id,
        UUID userAId,
        UUID userBId,
        String status,
        double totalScore,
        ScoreBreakdown breakdown,
        Instant createdAt,
        Instant expiresAt
) {}
