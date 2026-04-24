package com.skillswap.matchingservice.scoring;

import java.util.List;
import java.util.UUID;

public record SkillInfo(UUID categoryId, String name, List<String> tags) {}
