package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;

@Component
public final class TimezoneScorer implements Scorer {

    private final double weight;

    public TimezoneScorer(MatchingProperties properties) {
        this.weight = properties.timezone();
    }

    @Override
    public double weight() { return weight; }

    @Override
    public String name() { return "timezone"; }

    @Override
    public ScorerResult score(UserMatchProfile a, UserMatchProfile b) {
        if (a.timezone() == null || b.timezone() == null) {
            return new ScorerResult(0.5, "No timezone data - neutral");
        }
        double offsetA = offsetHours(a.timezone());
        double offsetB = offsetHours(b.timezone());
        double diff = Math.abs(offsetA - offsetB);
        double result = Math.max(0.0, 1.0 - (diff / 12.0));
        return new ScorerResult(result, "Timezone diff %.1f hours".formatted(diff));
    }

    private double offsetHours(String timezone) {
        try {
            return ZoneId.of(timezone).getRules()
                    .getOffset(Instant.now()).getTotalSeconds() / 3600.0;
        } catch (Exception e) {
            return 0.0;
        }
    }
}
