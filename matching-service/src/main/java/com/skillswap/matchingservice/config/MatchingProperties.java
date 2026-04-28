package com.skillswap.matchingservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "matching.weights")
public record MatchingProperties(
        double skillMatch,
        double jaccard,
        double reciprocity,
        double availability,
        double language,
        double rating,
        double timezone
) {
    private static final double EPSILON = 0.0001;

    public MatchingProperties {
        double sum = skillMatch + jaccard + reciprocity + availability + language + rating + timezone;
        if (sum > 1.0 + EPSILON) {
            throw new IllegalStateException(
                    "matching.weights sum exceeds 1.0: actual=" + sum
                            + " (skillMatch=" + skillMatch
                            + ", jaccard=" + jaccard
                            + ", reciprocity=" + reciprocity
                            + ", availability=" + availability
                            + ", language=" + language
                            + ", rating=" + rating
                            + ", timezone=" + timezone + ")");
        }
        if (skillMatch < 0 || jaccard < 0 || reciprocity < 0 || availability < 0
                || language < 0 || rating < 0 || timezone < 0) {
            throw new IllegalStateException("matching.weights must be non-negative");
        }
    }
}
