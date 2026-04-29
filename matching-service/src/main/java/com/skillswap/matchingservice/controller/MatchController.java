package com.skillswap.matchingservice.controller;

import com.skillswap.matchingservice.dto.response.MatchResponse;
import com.skillswap.matchingservice.dto.response.MatchSuggestion;
import com.skillswap.matchingservice.service.MatchingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
@AllArgsConstructor
@Tag(name = "Match", description = "Match suggestions with weighted score breakdown, accept/decline")
@SecurityRequirement(name = "bearerAuth")
public class MatchController {

    private final MatchingService matchingService;

    @GetMapping("/suggestions/{userId}")
    List<MatchSuggestion> getSuggestions(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "10") int limit) {
        return matchingService.getSuggestions(userId, limit);
    }

    @PostMapping("/{matchId}/accept")
    MatchResponse acceptMatch(@PathVariable UUID matchId) {
        return matchingService.acceptMatch(matchId);
    }

    @PostMapping("/{matchId}/decline")
    MatchResponse declineMatch(@PathVariable UUID matchId) {
        return matchingService.declineMatch(matchId);
    }

    @GetMapping("/history/{userId}")
    List<MatchResponse> getHistory(@PathVariable UUID userId) {
        return matchingService.getHistory(userId);
    }
}
