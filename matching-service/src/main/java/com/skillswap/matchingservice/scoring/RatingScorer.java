package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.springframework.stereotype.Component;

@Component
public final class RatingScorer implements Scorer {

    private static final double NEW_USER_SCORE = 0.6;
    private final double weight;

    public RatingScorer(MatchingProperties properties) {
        this.weight = properties.rating();
    }

    @Override
    public double weight() { return weight; }

    @Override
    public String name() { return "rating"; }

    @Override
    public ScorerResult score(UserMatchProfile a, UserMatchProfile b) {
        if (b.rating() == null) {
            return new ScorerResult(NEW_USER_SCORE, "New user - benefit of the doubt");
        }
        double normalized = b.rating().doubleValue() / 5.0;
        return new ScorerResult(normalized, "Rating %.2f / 5.0".formatted(b.rating()));
    }
}
