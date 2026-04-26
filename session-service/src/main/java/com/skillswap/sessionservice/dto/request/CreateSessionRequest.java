package com.skillswap.sessionservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record CreateSessionRequest(
        @NotNull UUID matchId,
        @NotNull UUID teacherId,
        @NotNull UUID learnerId,
        @NotBlank String skillName,
        @NotNull Instant scheduledAt,
        @Min(1) int durationTokens
) {}
