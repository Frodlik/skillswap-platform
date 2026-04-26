package com.skillswap.sessionservice.dto.response;

import com.skillswap.sessionservice.domain.SessionStatus;

import java.time.Instant;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        UUID matchId,
        UUID teacherId,
        UUID learnerId,
        String skillName,
        Instant scheduledAt,
        int durationTokens,
        SessionStatus status,
        Instant createdAt,
        Instant completedAt
) {}
