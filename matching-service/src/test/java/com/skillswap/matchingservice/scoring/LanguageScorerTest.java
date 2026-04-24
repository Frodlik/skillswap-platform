package com.skillswap.matchingservice.scoring;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class LanguageScorerTest {

    private final LanguageScorer scorer = new LanguageScorer();

    private UserMatchProfile profileWith(String primary, List<String> preferred) {
        return new UserMatchProfile(UUID.randomUUID(), primary, preferred,
                null, null, null, List.of(), List.of());
    }

    @Test
    void same_primary_language_returns_1() {
        var a = profileWith("EN", List.of("EN", "FR"));
        var b = profileWith("EN", List.of("EN", "DE"));

        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }

    @Test
    void same_primary_comparison_is_case_insensitive() {
        var a = profileWith("en", List.of());
        var b = profileWith("EN", List.of());

        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }

    @Test
    void shared_secondary_language_returns_05() {
        var a = profileWith("EN", List.of("EN", "FR"));
        var b = profileWith("DE", List.of("DE", "FR"));

        assertThat(scorer.score(a, b).value()).isCloseTo(0.5, within(0.001));
    }

    @Test
    void no_common_language_returns_0() {
        var a = profileWith("EN", List.of("EN", "FR"));
        var b = profileWith("DE", List.of("DE", "ES"));

        assertThat(scorer.score(a, b).value()).isCloseTo(0.0, within(0.001));
    }

    @Test
    void null_primary_falls_back_to_preferred() {
        var a = profileWith(null, List.of("FR"));
        var b = profileWith(null, List.of("FR", "ES"));

        assertThat(scorer.score(a, b).value()).isCloseTo(0.5, within(0.001));
    }
}
