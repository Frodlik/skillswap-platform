package com.skillswap.matchingservice.scoring;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class TimezoneScorerTest {

    private final TimezoneScorer scorer = new TimezoneScorer();

    private UserMatchProfile profileWith(String tz) {
        return new UserMatchProfile(UUID.randomUUID(), null, List.of(),
                tz, null, null, List.of(), List.of());
    }

    @Test
    void same_timezone_returns_1() {
        var a = profileWith("UTC");
        var b = profileWith("UTC");
        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }

    @Test
    void six_hour_diff_returns_05() {
        var a = profileWith("UTC");
        var b = profileWith("Asia/Dhaka"); // UTC+6
        assertThat(scorer.score(a, b).value()).isCloseTo(0.5, within(0.01));
    }

    @Test
    void twelve_hour_diff_returns_0() {
        var a = profileWith("UTC");
        var b = profileWith("Etc/GMT-12"); // UTC+12
        assertThat(scorer.score(a, b).value()).isCloseTo(0.0, within(0.01));
    }

    @Test
    void null_timezone_returns_neutral_05() {
        var a = profileWith(null);
        var b = profileWith("UTC");
        assertThat(scorer.score(a, b).value()).isCloseTo(0.5, within(0.001));
    }

    @Test
    void result_is_clamped_to_zero_for_large_diff() {
        var a = profileWith("Etc/GMT+12");
        var b = profileWith("Etc/GMT-12");
        assertThat(scorer.score(a, b).value()).isGreaterThanOrEqualTo(0.0);
    }
}
