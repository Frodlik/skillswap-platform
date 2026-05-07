package com.skillswap.moderationservice.dto.request;

import com.skillswap.moderationservice.domain.SanctionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record CreateSanctionRequest(
        @NotNull UUID userId,
        @NotNull SanctionType type,
        @NotBlank String reason,
        Instant expiresAt
) {}
