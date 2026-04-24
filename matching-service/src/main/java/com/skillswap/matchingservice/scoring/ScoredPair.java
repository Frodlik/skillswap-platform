package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.dto.response.ScoreBreakdown;

public record ScoredPair(double totalScore, ScoreBreakdown breakdown) {}
