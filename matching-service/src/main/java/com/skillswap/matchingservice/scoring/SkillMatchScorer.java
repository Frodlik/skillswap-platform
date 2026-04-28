package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public final class SkillMatchScorer implements Scorer {

    private final double weight;

    public SkillMatchScorer(MatchingProperties properties) {
        this.weight = properties.skillMatch();
    }

    @Override
    public double weight() { return weight; }

    @Override
    public String name() { return "skill-match"; }

    @Override
    public ScorerResult score(UserMatchProfile a, UserMatchProfile b) {
        boolean aOffersWhatBWants = hasNameMatch(a.offeredSkills(), b.wantedSkills());
        boolean bOffersWhatAWants = hasNameMatch(b.offeredSkills(), a.wantedSkills());

        if (aOffersWhatBWants && bOffersWhatAWants) {
            return new ScorerResult(1.0, "Bilateral skill match");
        }
        if (aOffersWhatBWants || bOffersWhatAWants) {
            return new ScorerResult(0.5, "Unilateral skill match");
        }
        if (hasCategoryMatch(a.offeredSkills(), b.wantedSkills()) ||
            hasCategoryMatch(b.offeredSkills(), a.wantedSkills())) {
            return new ScorerResult(0.3, "Partial category match");
        }
        return new ScorerResult(0.0, "No skill match");
    }

    private boolean hasNameMatch(List<SkillInfo> offered, List<SkillInfo> wanted) {
        return offered.stream().anyMatch(o ->
                wanted.stream().anyMatch(w -> o.name().equalsIgnoreCase(w.name())));
    }

    private boolean hasCategoryMatch(List<SkillInfo> offered, List<SkillInfo> wanted) {
        return offered.stream().anyMatch(o ->
                o.categoryId() != null &&
                wanted.stream().anyMatch(w -> o.categoryId().equals(w.categoryId())));
    }
}
