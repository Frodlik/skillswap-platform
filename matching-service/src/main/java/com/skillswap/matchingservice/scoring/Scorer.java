package com.skillswap.matchingservice.scoring;

public sealed interface Scorer
        permits SkillMatchScorer, JaccardScorer, AvailabilityScorer,
                LanguageScorer, RatingScorer, TimezoneScorer {

    ScorerResult score(UserMatchProfile a, UserMatchProfile b);

    double weight();

    String name();
}
