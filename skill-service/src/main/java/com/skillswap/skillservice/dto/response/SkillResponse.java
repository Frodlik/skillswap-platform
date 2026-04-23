package com.skillswap.skillservice.dto.response;

import com.skillswap.skillservice.domain.SkillType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SkillResponse(
        UUID id,
        UUID userId,
        UUID categoryId,
        String categoryName,
        String name,
        int level,
        SkillType type,
        List<String> tags,
        String description,
        Instant createdAt
) {}
