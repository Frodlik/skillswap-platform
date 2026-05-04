package com.skillswap.notificationservice.event;

import java.util.UUID;

public record MatchFoundEvent(UUID matchId, UUID userAId, UUID userBId, double totalScore) {}
