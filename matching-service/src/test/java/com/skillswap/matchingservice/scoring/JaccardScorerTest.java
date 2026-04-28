package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class JaccardScorerTest {

    private final JaccardScorer scorer = new JaccardScorer(
            new MatchingProperties(0.30, 0.20, 0.10, 0.15, 0.10, 0.10, 0.05));

    private UserMatchProfile profileWith(List<String> offeredTags, List<String> wantedTags) {
        UUID cat = UUID.randomUUID();
        return new UserMatchProfile(UUID.randomUUID(), null, List.of(), null, null, null,
                List.of(new SkillInfo(cat, "s", offeredTags)),
                List.of(new SkillInfo(cat, "s", wantedTags)));
    }

    @Test
    void identical_tags_returns_1() {
        var a = profileWith(List.of("python", "ml"), List.of("java", "spring"));
        var b = profileWith(List.of("java", "spring"), List.of("python", "ml"));

        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }

    @Test
    void partial_overlap() {
        var a = profileWith(List.of("python", "ml", "data"), List.of("java"));
        var b = profileWith(List.of("java", "spring"), List.of("python", "ml"));

        // jaccardAB: offersA∩wantsB = {python,ml}, union={python,ml,data} → 2/3 = 0.667
        // jaccardBA: offersB∩wantsA = {java}, union={java,spring} → 1/2 = 0.5
        // avg = 0.583
        assertThat(scorer.score(a, b).value()).isCloseTo(0.583, within(0.01));
    }

    @Test
    void no_overlap_returns_0() {
        var a = profileWith(List.of("python"), List.of("java"));
        var b = profileWith(List.of("rust"), List.of("go"));

        assertThat(scorer.score(a, b).value()).isCloseTo(0.0, within(0.001));
    }

    @Test
    void empty_tags_returns_0() {
        var a = profileWith(List.of(), List.of());
        var b = profileWith(List.of(), List.of());

        assertThat(scorer.score(a, b).value()).isCloseTo(0.0, within(0.001));
    }

    @Test
    void tag_comparison_is_case_insensitive() {
        var a = profileWith(List.of("Python"), List.of("Java"));
        var b = profileWith(List.of("JAVA"), List.of("PYTHON"));

        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }
}
