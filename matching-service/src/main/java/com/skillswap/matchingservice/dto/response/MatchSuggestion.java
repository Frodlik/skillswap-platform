package com.skillswap.matchingservice.dto.response;

import java.util.UUID;

public record MatchSuggestion(UUID matchId, UUID userId, double totalScore, ScoreBreakdown breakdown) {}
