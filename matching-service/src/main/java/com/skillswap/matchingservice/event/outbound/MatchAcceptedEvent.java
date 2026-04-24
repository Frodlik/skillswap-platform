package com.skillswap.matchingservice.event.outbound;

import java.util.UUID;

public record MatchAcceptedEvent(UUID matchId, UUID userAId, UUID userBId) {}
