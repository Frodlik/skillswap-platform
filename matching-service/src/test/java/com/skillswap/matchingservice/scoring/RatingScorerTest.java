package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class RatingScorerTest {

    private final RatingScorer scorer = new RatingScorer(
            new MatchingProperties(0.30, 0.20, 0.10, 0.15, 0.10, 0.10, 0.05));

    private UserMatchProfile candidateWithRating(BigDecimal rating) {
        return new UserMatchProfile(UUID.randomUUID(), null, List.of(),
                null, null, rating, List.of(), List.of());
    }

    private UserMatchProfile anyUser() {
        return candidateWithRating(new BigDecimal("3.0"));
    }

    @Test
    void high_rating_normalized_correctly() {
        var candidate = candidateWithRating(new BigDecimal("4.0"));
        assertThat(scorer.score(anyUser(), candidate).value()).isCloseTo(0.8, within(0.001));
    }

    @Test
    void low_rating_normalized_correctly() {
        var candidate = candidateWithRating(new BigDecimal("2.5"));
        assertThat(scorer.score(anyUser(), candidate).value()).isCloseTo(0.5, within(0.001));
    }

    @Test
    void null_rating_returns_benefit_of_the_doubt() {
        var candidate = candidateWithRating(null);
        assertThat(scorer.score(anyUser(), candidate).value()).isCloseTo(0.6, within(0.001));
    }

    @Test
    void perfect_rating_returns_1() {
        var candidate = candidateWithRating(new BigDecimal("5.0"));
        assertThat(scorer.score(anyUser(), candidate).value()).isCloseTo(1.0, within(0.001));
    }
}
