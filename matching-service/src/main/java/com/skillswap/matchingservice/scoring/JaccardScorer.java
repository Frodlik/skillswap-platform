package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.config.MatchingProperties;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public final class JaccardScorer implements Scorer {

    private final double weight;

    public JaccardScorer(MatchingProperties properties) {
        this.weight = properties.jaccard();
    }

    @Override
    public double weight() { return weight; }

    @Override
    public String name() { return "jaccard"; }

    @Override
    public ScorerResult score(UserMatchProfile a, UserMatchProfile b) {
        Set<String> tagsOfferedA = collectTags(a.offeredSkills());
        Set<String> tagsWantedB = collectTags(b.wantedSkills());
        Set<String> tagsOfferedB = collectTags(b.offeredSkills());
        Set<String> tagsWantedA = collectTags(a.wantedSkills());

        double jaccardAB = jaccard(tagsOfferedA, tagsWantedB);
        double jaccardBA = jaccard(tagsOfferedB, tagsWantedA);
        double result = (jaccardAB + jaccardBA) / 2.0;

        return new ScorerResult(result,
                "Jaccard A->B=%.2f, B->A=%.2f".formatted(jaccardAB, jaccardBA));
    }

    private Set<String> collectTags(List<SkillInfo> skills) {
        return skills.stream()
                .flatMap(s -> s.tags().stream())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    private double jaccard(Set<String> a, Set<String> b) {
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        if (union.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        return (double) intersection.size() / union.size();
    }
}
