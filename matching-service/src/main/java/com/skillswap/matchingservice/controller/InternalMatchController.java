package com.skillswap.matchingservice.controller;

import com.skillswap.matchingservice.scoring.ScoredPair;
import com.skillswap.matchingservice.service.MatchingService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/internal/match")
@AllArgsConstructor
class InternalMatchController {

    private final MatchingService matchingService;

    @GetMapping("/score/{userA}/{userB}")
    ScoredPair getScore(@PathVariable UUID userA, @PathVariable UUID userB) {
        return matchingService.computeScore(userA, userB);
    }
}
