package com.skillswap.matchingservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.matchingservice.client.SkillServiceClient;
import com.skillswap.matchingservice.client.UserServiceClient;
import com.skillswap.matchingservice.client.response.SkillClientResponse;
import com.skillswap.matchingservice.client.response.UserBriefClientResponse;
import com.skillswap.matchingservice.client.response.UserPreferenceClientResponse;
import com.skillswap.matchingservice.domain.Match;
import com.skillswap.matchingservice.domain.MatchStatus;
import com.skillswap.matchingservice.dto.response.MatchResponse;
import com.skillswap.matchingservice.dto.response.MatchSuggestion;
import com.skillswap.matchingservice.dto.response.ScoreBreakdown;
import com.skillswap.matchingservice.exception.MatchNotFoundException;
import com.skillswap.matchingservice.messaging.MatchEventPublisher;
import com.skillswap.matchingservice.repository.KnownUserRepository;
import com.skillswap.matchingservice.repository.MatchRepository;
import com.skillswap.matchingservice.scoring.ScoredPair;
import com.skillswap.matchingservice.scoring.ScoringEngine;
import com.skillswap.matchingservice.scoring.SkillInfo;
import com.skillswap.matchingservice.scoring.UserMatchProfile;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MatchingService {

    private static final Logger log = LoggerFactory.getLogger(MatchingService.class);
    private static final double MATCH_FOUND_THRESHOLD = 0.6;

    private final MatchRepository matchRepository;
    private final KnownUserRepository knownUserRepository;
    private final ScoringEngine scoringEngine;
    private final UserServiceClient userServiceClient;
    private final SkillServiceClient skillServiceClient;
    private final MatchEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<MatchSuggestion> getSuggestions(UUID userId, int limit) {
        return matchRepository
                .findActiveSuggestions(userId, Instant.now(), PageRequest.of(0, limit))
                .stream()
                .map(m -> toSuggestion(m, userId))
                .toList();
    }

    @Transactional
    public MatchResponse acceptMatch(UUID matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new MatchNotFoundException(matchId));
        match.setStatus(MatchStatus.ACCEPTED);
        Match saved = matchRepository.save(match);
        eventPublisher.publishMatchAccepted(saved);
        return toResponse(saved);
    }

    @Transactional
    public MatchResponse declineMatch(UUID matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new MatchNotFoundException(matchId));
        match.setStatus(MatchStatus.DECLINED);
        return toResponse(matchRepository.save(match));
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getHistory(UUID userId) {
        return matchRepository.findHistory(userId).stream().map(this::toResponse).toList();
    }

    public ScoredPair computeScore(UUID userAId, UUID userBId) {
        return scoringEngine.score(buildProfile(userAId), buildProfile(userBId));
    }

    @Transactional
    public void recomputeForUser(UUID userId) {
        List<UUID> candidates = knownUserRepository.findAllIds().stream()
                .filter(id -> !id.equals(userId))
                .toList();

        UserMatchProfile profileA = buildProfile(userId);
        log.info("Recomputing matches for userId={}, candidates={}", userId, candidates.size());

        for (UUID candidateId : candidates) {
            try {
                UserMatchProfile profileB = buildProfile(candidateId);
                ScoredPair scored = scoringEngine.score(profileA, profileB);

                Optional<Match> existing = matchRepository.findPendingBetween(userId, candidateId);
                boolean isNew = existing.isEmpty();

                Match match = existing.orElseGet(() -> Match.builder()
                        .id(UUID.randomUUID())
                        .userAId(userId)
                        .userBId(candidateId)
                        .status(MatchStatus.PENDING)
                        .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                        .build());

                match.setTotalScore(scored.totalScore());
                match.setScoreBreakdown(toJson(scored.breakdown()));
                matchRepository.save(match);

                if (isNew && scored.totalScore() > MATCH_FOUND_THRESHOLD) {
                    eventPublisher.publishMatchFound(match);
                }
            } catch (Exception e) {
                log.warn("Failed to score pair userId={} candidateId={}: {}",
                        userId, candidateId, e.getMessage());
            }
        }
    }

    public UserMatchProfile buildProfile(UUID userId) {
        UserBriefClientResponse brief = userServiceClient.getBrief(userId);
        UserPreferenceClientResponse prefs = userServiceClient.getPreferences(userId);
        List<SkillClientResponse> skills = skillServiceClient.getUserSkills(userId);

        List<SkillInfo> offered = skills.stream()
                .filter(s -> "OFFER".equals(s.type()))
                .map(s -> new SkillInfo(s.categoryId(), s.name(),
                        s.tags() != null ? s.tags() : List.of()))
                .toList();

        List<SkillInfo> wanted = skills.stream()
                .filter(s -> "WANT".equals(s.type()))
                .map(s -> new SkillInfo(s.categoryId(), s.name(),
                        s.tags() != null ? s.tags() : List.of()))
                .toList();

        return new UserMatchProfile(
                userId,
                brief != null ? brief.language() : null,
                prefs != null && prefs.preferredLanguages() != null
                        ? prefs.preferredLanguages() : List.of(),
                brief != null ? brief.timezone() : null,
                prefs != null ? prefs.availabilitySchedule() : null,
                brief != null ? brief.rating() : null,
                offered,
                wanted);
    }

    private MatchSuggestion toSuggestion(Match match, UUID requestingUserId) {
        UUID candidateId = match.getUserAId().equals(requestingUserId)
                ? match.getUserBId() : match.getUserAId();
        return new MatchSuggestion(match.getId(), candidateId,
                match.getTotalScore(), fromJson(match.getScoreBreakdown()));
    }

    private MatchResponse toResponse(Match match) {
        return new MatchResponse(match.getId(), match.getUserAId(), match.getUserBId(),
                match.getStatus().name(), match.getTotalScore(),
                fromJson(match.getScoreBreakdown()), match.getCreatedAt(), match.getExpiresAt());
    }

    private String toJson(ScoreBreakdown breakdown) {
        try {
            return objectMapper.writeValueAsString(breakdown);
        } catch (Exception e) {
            return "{}";
        }
    }

    private ScoreBreakdown fromJson(String json) {
        if (json == null) return new ScoreBreakdown(List.of());
        try {
            return objectMapper.readValue(json, ScoreBreakdown.class);
        } catch (Exception e) {
            return new ScoreBreakdown(List.of());
        }
    }
}
