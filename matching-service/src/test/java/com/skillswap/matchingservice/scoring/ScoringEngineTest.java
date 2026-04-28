package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class ScoringEngineTest {

    private final MatchingProperties props =
            new MatchingProperties(0.30, 0.20, 0.10, 0.15, 0.10, 0.10, 0.05);

    private final List<Scorer> scorers = List.of(
            new SkillMatchScorer(props),
            new JaccardScorer(props),
            new ReciprocityScorer(props),
            new AvailabilityScorer(props),
            new LanguageScorer(props),
            new RatingScorer(props),
            new TimezoneScorer(props));

    private final ScoringEngine engine = new ScoringEngine(scorers);

    @Test
    void weights_sum_to_one() {
        double sum = scorers.stream().mapToDouble(Scorer::weight).sum();
        assertThat(sum).isCloseTo(1.0, within(0.0001));
    }

    @Test
    void total_score_is_weighted_sum_for_perfect_match() {
        UUID cat = UUID.randomUUID();
        var a = new UserMatchProfile(UUID.randomUUID(), "EN", List.of("EN"),
                "UTC", "{\"MON\":[{\"from\":9,\"to\":17}]}", new BigDecimal("5.0"),
                List.of(new SkillInfo(cat, "Python", List.of("python"))),
                List.of(new SkillInfo(cat, "Java", List.of("java"))));
        var b = new UserMatchProfile(UUID.randomUUID(), "EN", List.of("EN"),
                "UTC", "{\"MON\":[{\"from\":9,\"to\":17}]}", new BigDecimal("5.0"),
                List.of(new SkillInfo(cat, "Java", List.of("java"))),
                List.of(new SkillInfo(cat, "Python", List.of("python"))));

        var result = engine.score(a, b);

        assertThat(result.totalScore()).isCloseTo(1.0, within(0.01));
        assertThat(result.breakdown().details()).hasSize(7);
    }

    @Test
    void all_empty_profiles_give_neutral_score() {
        var empty = new UserMatchProfile(UUID.randomUUID(), null, List.of(),
                null, null, null, List.of(), List.of());
        var result = engine.score(empty, empty);

        // SkillMatch=0, Jaccard=0, Reciprocity=0, Availability=0.5, Language=0, Rating=0.6, Timezone=0.5
        // weighted: 0.15*0.5 + 0.10*0.6 + 0.05*0.5 = 0.075 + 0.06 + 0.025 = 0.16
        assertThat(result.totalScore()).isCloseTo(0.16, within(0.01));
    }

    @Test
    void breakdown_contains_entry_per_scorer() {
        var empty = new UserMatchProfile(UUID.randomUUID(), null, List.of(),
                null, null, null, List.of(), List.of());
        var result = engine.score(empty, empty);

        assertThat(result.breakdown().details())
                .extracting(com.skillswap.matchingservice.dto.response.ScorerDetail::name)
                .containsExactlyInAnyOrder(
                        "skill-match", "jaccard", "reciprocity", "availability",
                        "language", "rating", "timezone");
    }

    @Test
    void weights_validation_rejects_sum_exceeding_one() {
        // Sanity check that MatchingProperties guards against misconfiguration.
        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalStateException.class,
                () -> new MatchingProperties(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5));
    }
}
