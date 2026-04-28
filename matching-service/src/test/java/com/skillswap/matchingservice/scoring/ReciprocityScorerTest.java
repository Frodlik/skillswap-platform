package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class ReciprocityScorerTest {

    private final ReciprocityScorer scorer = new ReciprocityScorer(
            new MatchingProperties(0.30, 0.20, 0.10, 0.15, 0.10, 0.10, 0.05));

    private final UUID cat = UUID.randomUUID();

    private UserMatchProfile profileWith(List<SkillInfo> offered, List<SkillInfo> wanted) {
        return new UserMatchProfile(UUID.randomUUID(), null, List.of(),
                null, null, null, offered, wanted);
    }

    private SkillInfo skill(String name, String... tags) {
        return new SkillInfo(cat, name, List.of(tags));
    }

    @Test
    void bilateral_name_match_returns_1() {
        var a = profileWith(
                List.of(skill("Java")),
                List.of(skill("Python")));
        var b = profileWith(
                List.of(skill("Python")),
                List.of(skill("Java")));

        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }

    @Test
    void bilateral_tag_overlap_returns_1() {
        var a = profileWith(
                List.of(skill("Backend Engineering", "spring", "jpa")),
                List.of(skill("Image Editing", "photoshop")));
        var b = profileWith(
                List.of(skill("Adobe Suite", "photoshop", "illustrator")),
                List.of(skill("Java Web", "spring")));

        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }

    @Test
    void only_a_benefits_returns_03() {
        // B offers Java which A wants; A offers Drawing which B does not want.
        var a = profileWith(
                List.of(skill("Drawing")),
                List.of(skill("Java")));
        var b = profileWith(
                List.of(skill("Java")),
                List.of(skill("Cooking")));

        var result = scorer.score(a, b);
        assertThat(result.value()).isCloseTo(0.3, within(0.001));
        assertThat(result.explanation()).contains("B -> A");
    }

    @Test
    void only_b_benefits_returns_03() {
        var a = profileWith(
                List.of(skill("Java")),
                List.of(skill("Cooking")));
        var b = profileWith(
                List.of(skill("Drawing")),
                List.of(skill("Java")));

        var result = scorer.score(a, b);
        assertThat(result.value()).isCloseTo(0.3, within(0.001));
        assertThat(result.explanation()).contains("A -> B");
    }

    @Test
    void no_overlap_returns_0() {
        var a = profileWith(
                List.of(skill("Java")),
                List.of(skill("Photoshop")));
        var b = profileWith(
                List.of(skill("Cooking")),
                List.of(skill("Spanish")));

        assertThat(scorer.score(a, b).value()).isCloseTo(0.0, within(0.001));
    }

    @Test
    void empty_profiles_return_0() {
        var empty = profileWith(List.of(), List.of());
        assertThat(scorer.score(empty, empty).value()).isCloseTo(0.0, within(0.001));
    }

    @Test
    void match_is_case_insensitive() {
        var a = profileWith(
                List.of(skill("python")),
                List.of(skill("JAVA")));
        var b = profileWith(
                List.of(skill("Java")),
                List.of(skill("Python")));

        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }
}
