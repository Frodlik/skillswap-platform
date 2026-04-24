package com.skillswap.matchingservice.event.outbound;

import java.util.UUID;

public record MatchFoundEvent(UUID matchId, UUID userAId, UUID userBId, double totalScore) {}
