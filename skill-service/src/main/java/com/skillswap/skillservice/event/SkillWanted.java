package com.skillswap.skillservice.event;

import java.util.List;
import java.util.UUID;

public record SkillWanted(UUID userId, UUID skillId, String name, List<String> tags) {}
