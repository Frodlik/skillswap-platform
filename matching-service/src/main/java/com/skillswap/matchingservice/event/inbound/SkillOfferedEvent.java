package com.skillswap.matchingservice.event.inbound;

import java.util.List;
import java.util.UUID;

public record SkillOfferedEvent(UUID userId, UUID skillId, String name, List<String> tags) {}
