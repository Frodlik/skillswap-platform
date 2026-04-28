package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class AvailabilityScorerTest {

    private final AvailabilityScorer scorer = new AvailabilityScorer(
            new MatchingProperties(0.30, 0.20, 0.10, 0.15, 0.10, 0.10, 0.05));

    private UserMatchProfile profileWith(String schedule) {
        return new UserMatchProfile(UUID.randomUUID(), null, List.of(),
                null, schedule, null, List.of(), List.of());
    }

    @Test
    void full_overlap_returns_1() {
        String schedule = "{\"MON\": [{\"from\": 9, \"to\": 17}]}";
        var a = profileWith(schedule);
        var b = profileWith(schedule);

        assertThat(scorer.score(a, b).value()).isCloseTo(1.0, within(0.001));
    }

    @Test
    void partial_overlap() {
        var a = profileWith("{\"MON\": [{\"from\": 9, \"to\": 17}]}");   // 8 hours
        var b = profileWith("{\"MON\": [{\"from\": 13, \"to\": 21}]}");  // 8 hours, overlap 13-17 = 4h

        // overlap=4, max=8, result=0.5
        assertThat(scorer.score(a, b).value()).isCloseTo(0.5, within(0.001));
    }

    @Test
    void no_overlap_returns_0() {
        var a = profileWith("{\"MON\": [{\"from\": 8, \"to\": 12}]}");
        var b = profileWith("{\"MON\": [{\"from\": 14, \"to\": 18}]}");

        assertThat(scorer.score(a, b).value()).isCloseTo(0.0, within(0.001));
    }

    @Test
    void null_schedule_returns_neutral_05() {
        var a = profileWith(null);
        var b = profileWith("{\"MON\": [{\"from\": 9, \"to\": 17}]}");

        assertThat(scorer.score(a, b).value()).isCloseTo(0.5, within(0.001));
    }

    @Test
    void both_null_returns_neutral_05() {
        assertThat(scorer.score(profileWith(null), profileWith(null)).value())
                .isCloseTo(0.5, within(0.001));
    }
}
