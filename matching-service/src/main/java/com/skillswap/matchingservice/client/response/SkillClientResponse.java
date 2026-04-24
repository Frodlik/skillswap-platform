package com.skillswap.matchingservice.client.response;

import java.util.List;
import java.util.UUID;

public record SkillClientResponse(
        UUID id,
        UUID categoryId,
        String name,
        String type,
        List<String> tags
) {}
