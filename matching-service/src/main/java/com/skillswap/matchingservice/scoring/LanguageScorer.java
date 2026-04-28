package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public final class LanguageScorer implements Scorer {

    private final double weight;

    public LanguageScorer(MatchingProperties properties) {
        this.weight = properties.language();
    }

    @Override
    public double weight() { return weight; }

    @Override
    public String name() { return "language"; }

    @Override
    public ScorerResult score(UserMatchProfile a, UserMatchProfile b) {
        if (a.primaryLanguage() != null && b.primaryLanguage() != null
                && a.primaryLanguage().equalsIgnoreCase(b.primaryLanguage())) {
            return new ScorerResult(1.0, "Same primary language");
        }
        Set<String> langsA = normalised(a);
        Set<String> langsB = normalised(b);
        boolean hasCommon = langsA.stream().anyMatch(langsB::contains);
        if (hasCommon) return new ScorerResult(0.5, "Shared secondary language");
        return new ScorerResult(0.0, "No common language");
    }

    private Set<String> normalised(UserMatchProfile p) {
        Set<String> langs = new HashSet<>();
        if (p.primaryLanguage() != null) langs.add(p.primaryLanguage().toLowerCase());
        if (p.preferredLanguages() != null) {
            p.preferredLanguages().forEach(l -> langs.add(l.toLowerCase()));
        }
        return langs;
    }
}
