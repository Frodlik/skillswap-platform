package com.skillswap.skillservice.dto.request;

import com.skillswap.skillservice.domain.SkillType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record SkillCreateRequest(
        @NotBlank String name,
        @NotNull UUID categoryId,
        @NotNull @Min(1) @Max(5) Integer level,
        @NotNull SkillType type,
        @Valid List<@NotBlank String> tags,
        String description
) {}
