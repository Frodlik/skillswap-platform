package com.skillswap.matchingservice.dto.response;

import java.util.List;
import java.util.UUID;

// Returned by GET /api/v1/matches/suggestions/{userId}.
//   theirOffers — what the candidate can teach (so the requester can decide
//                 if any of it overlaps with what they want to learn)
//   theirWants  — what the candidate is looking to learn (so the requester
//                 can pick which of their own offers to teach)
//
// We enrich the suggestion server-side via a single skill-service hop in
// MatchingService.toSuggestion. The frontend used to call skill-service
// itself for each match — moving the join here saves N round trips.
public record MatchSuggestion(
        UUID matchId,
        UUID userId,
        double totalScore,
        ScoreBreakdown breakdown,
        List<SkillBrief> theirOffers,
        List<SkillBrief> theirWants
) {}
