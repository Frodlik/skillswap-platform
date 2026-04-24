package com.skillswap.matchingservice.scoring;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record UserMatchProfile(
        UUID userId,
        String primaryLanguage,
        List<String> preferredLanguages,
        String timezone,
        String availabilitySchedule,
        BigDecimal rating,
        List<SkillInfo> offeredSkills,
        List<SkillInfo> wantedSkills
) {}
