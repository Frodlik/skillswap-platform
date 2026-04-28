package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Measures how reciprocal the exchange is — does each user have something the other wants?
 * Permissive: counts skill name match OR shared tag as a benefit, regardless of category.
 *
 * <ul>
 *   <li>1.0 — both A benefits from B AND B benefits from A (true two-way exchange)</li>
 *   <li>0.3 — one-sided (only one of them gets something)</li>
 *   <li>0.0 — no overlap in either direction</li>
 * </ul>
 *
 * Distinct from SkillMatchScorer (which requires exact name match for "bilateral" tier).
 */
@Component
public final class ReciprocityScorer implements Scorer {

    private final double weight;

    public ReciprocityScorer(MatchingProperties properties) {
        this.weight = properties.reciprocity();
    }

    @Override
    public double weight() { return weight; }

    @Override
    public String name() { return "reciprocity"; }

    @Override
    public ScorerResult score(UserMatchProfile a, UserMatchProfile b) {
        boolean aBenefits = hasOverlap(b.offeredSkills(), a.wantedSkills());
        boolean bBenefits = hasOverlap(a.offeredSkills(), b.wantedSkills());

        if (aBenefits && bBenefits) {
            return new ScorerResult(1.0, "Two-way exchange: both teach and learn");
        }
        if (aBenefits || bBenefits) {
            String dir = aBenefits ? "B -> A" : "A -> B";
            return new ScorerResult(0.3, "One-way only (" + dir + ")");
        }
        return new ScorerResult(0.0, "Neither side benefits");
    }

    private boolean hasOverlap(List<SkillInfo> offered, List<SkillInfo> wanted) {
        if (offered.isEmpty() || wanted.isEmpty()) return false;
        Set<String> offeredNames = new HashSet<>();
        Set<String> offeredTags = new HashSet<>();
        for (SkillInfo o : offered) {
            offeredNames.add(o.name().toLowerCase());
            o.tags().forEach(t -> offeredTags.add(t.toLowerCase()));
        }
        for (SkillInfo w : wanted) {
            if (offeredNames.contains(w.name().toLowerCase())) return true;
            for (String tag : w.tags()) {
                if (offeredTags.contains(tag.toLowerCase())) return true;
            }
        }
        return false;
    }
}
