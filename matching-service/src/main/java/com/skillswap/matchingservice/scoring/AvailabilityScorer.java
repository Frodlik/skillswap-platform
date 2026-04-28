package com.skillswap.matchingservice.scoring;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.matchingservice.config.MatchingProperties;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Component
public final class AvailabilityScorer implements Scorer {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final double weight;

    public AvailabilityScorer(MatchingProperties properties) {
        this.weight = properties.availability();
    }

    @Override
    public double weight() { return weight; }

    @Override
    public String name() { return "availability"; }

    @Override
    public ScorerResult score(UserMatchProfile a, UserMatchProfile b) {
        if (a.availabilitySchedule() == null || b.availabilitySchedule() == null) {
            return new ScorerResult(0.5, "No availability data - neutral");
        }
        Map<String, List<TimeSlot>> schedA = parse(a.availabilitySchedule());
        Map<String, List<TimeSlot>> schedB = parse(b.availabilitySchedule());

        int hoursA = totalHours(schedA);
        int hoursB = totalHours(schedB);
        int maxHours = Math.max(hoursA, hoursB);

        if (maxHours == 0) return new ScorerResult(0.5, "No availability data - neutral");

        int overlap = overlapHours(schedA, schedB);
        double result = (double) overlap / maxHours;
        return new ScorerResult(result, "Overlap %d / max %d hours".formatted(overlap, maxHours));
    }

    private Map<String, List<TimeSlot>> parse(String json) {
        try {
            return MAPPER.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }

    private int totalHours(Map<String, List<TimeSlot>> schedule) {
        return schedule.values().stream()
                .flatMap(Collection::stream)
                .mapToInt(s -> Math.max(0, s.to() - s.from()))
                .sum();
    }

    private int overlapHours(Map<String, List<TimeSlot>> a, Map<String, List<TimeSlot>> b) {
        return a.entrySet().stream().mapToInt(e -> {
            List<TimeSlot> bSlots = b.getOrDefault(e.getKey(), List.of());
            return e.getValue().stream()
                    .mapToInt(sa -> bSlots.stream()
                            .mapToInt(sb -> Math.max(0, Math.min(sa.to(), sb.to()) - Math.max(sa.from(), sb.from())))
                            .sum())
                    .sum();
        }).sum();
    }

    record TimeSlot(int from, int to) {}
}
