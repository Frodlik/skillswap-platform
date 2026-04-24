package com.skillswap.matchingservice.scoring;

import org.springframework.stereotype.Component;

@Component
public final class SkillMatchScorer implements Scorer {

    @Override
    public ScorerResult score(UserMatchProfile a, UserMatchProfile b) {
        return new ScorerResult(0.0, "stub");
    }

    @Override
    public double weight() { return 0.35; }

    @Override
    public String name() { return "skill-match"; }
}
