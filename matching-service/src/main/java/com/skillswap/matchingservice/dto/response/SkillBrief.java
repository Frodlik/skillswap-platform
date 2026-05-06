package com.skillswap.matchingservice.dto.response;

import java.util.List;

// Compact skill descriptor for embedding inside MatchSuggestion. Drops
// internal IDs and the OFFER/WANT discriminator (caller sees the
// classification implicitly from which list the skill is in).
public record SkillBrief(String name, List<String> tags) {}
