package com.skillswap.matchingservice.scoring;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class ScoringEngineTest {

    private final List<Scorer> scorers = List.of(
            new SkillMatchScorer(),
            new JaccardScorer(),
            new AvailabilityScorer(),
            new LanguageScorer(),
            new RatingScorer(),
            new TimezoneScorer());

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
        assertThat(result.breakdown().details()).hasSize(6);
    }

    @Test
    void all_empty_profiles_give_neutral_score() {
        var empty = new UserMatchProfile(UUID.randomUUID(), null, List.of(),
                null, null, null, List.of(), List.of());
        var result = engine.score(empty, empty);

        // SkillMatch=0, Jaccard=0, Availability=0.5, Language=0, Rating=0.6, Timezone=0.5
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
                        "skill-match", "jaccard", "availability",
                        "language", "rating", "timezone");
    }
}
