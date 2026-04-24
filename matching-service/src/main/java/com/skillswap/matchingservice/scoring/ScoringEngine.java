package com.skillswap.matchingservice.scoring;

import com.skillswap.matchingservice.dto.response.ScoreBreakdown;
import com.skillswap.matchingservice.dto.response.ScorerDetail;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScoringEngine {

    private final List<Scorer> scorers;

    public ScoringEngine(List<Scorer> scorers) {
        this.scorers = scorers;
    }

    public ScoredPair score(UserMatchProfile a, UserMatchProfile b) {
        List<ScorerDetail> details = scorers.stream()
                .map(s -> {
                    ScorerResult r = s.score(a, b);
                    return new ScorerDetail(s.name(), s.weight(), r.value(), r.explanation());
                })
                .toList();

        double total = details.stream()
                .mapToDouble(d -> d.weight() * d.value())
                .sum();

        return new ScoredPair(total, new ScoreBreakdown(details));
    }
}
