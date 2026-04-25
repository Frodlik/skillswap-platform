package com.skillswap.sessionservice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ReviewRequest(
        @NotNull UUID reviewerId,
        @NotNull UUID revieweeId,
        @Min(1) @Max(5) int rating,
        @Size(max = 2000) String comment
) {}
