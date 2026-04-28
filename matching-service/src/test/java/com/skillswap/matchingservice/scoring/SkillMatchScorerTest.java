package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class SkillMatchScorerTest {

    private final SkillMatchScorer scorer = new SkillMatchScorer(
            new MatchingProperties(0.30, 0.20, 0.10, 0.15, 0.10, 0.10, 0.05));
    private final UUID catA = UUID.randomUUID();
    private final UUID catB = UUID.randomUUID();

    private UserMatchProfile profileWith(List<SkillInfo> offered, List<SkillInfo> wanted) {
        return new UserMatchProfile(UUID.randomUUID(), null, List.of(),
                null, null, null, offered, wanted);
    }

    @Test
    void bilateral_match_returns_1() {
        var a = profileWith(
                List.of(new SkillInfo(catA, "Python", List.of())),
                List.of(new SkillInfo(catB, "Java", List.of())));
        var b = profileWith(
                List.of(new SkillInfo(catB, "Java", List.of())),
                List.of(new SkillInfo(catA, "Python", List.of())));

        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }

    @Test
    void unilateral_match_returns_0_5() {
        var a = profileWith(
                List.of(new SkillInfo(catA, "Python", List.of())),
                List.of(new SkillInfo(catB, "Java", List.of())));
        var b = profileWith(
                List.of(new SkillInfo(catA, "Python", List.of())),
                List.of(new SkillInfo(catA, "Python", List.of())));

        assertThat(scorer.score(a, b).value()).isCloseTo(0.5, within(0.001));
    }

    @Test
    void partial_category_match_returns_0_3() {
        var a = profileWith(
                List.of(new SkillInfo(catA, "Python", List.of())),
                List.of(new SkillInfo(catB, "Java", List.of())));
        var b = profileWith(
                List.of(new SkillInfo(catB, "Kotlin", List.of())),
                List.of(new SkillInfo(catA, "Rust", List.of())));

        assertThat(scorer.score(a, b).value()).isCloseTo(0.3, within(0.001));
    }

    @Test
    void no_match_returns_0() {
        var a = profileWith(
                List.of(new SkillInfo(catA, "Python", List.of())),
                List.of(new SkillInfo(catB, "Java", List.of())));
        var b = profileWith(
                List.of(new SkillInfo(UUID.randomUUID(), "Drawing", List.of())),
                List.of(new SkillInfo(UUID.randomUUID(), "Cooking", List.of())));

        assertThat(scorer.score(a, b).value()).isCloseTo(0.0, within(0.001));
    }

    @Test
    void match_is_case_insensitive() {
        var a = profileWith(List.of(new SkillInfo(catA, "python", List.of())), List.of());
        var b = profileWith(List.of(), List.of(new SkillInfo(catA, "PYTHON", List.of())));

        assertThat(scorer.score(a, b).value()).isCloseTo(0.5, within(0.001));
    }
}
