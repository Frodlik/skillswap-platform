package com.skillswap.notificationservice.event;

import java.util.UUID;

public record MatchAcceptedEvent(UUID matchId, UUID userAId, UUID userBId) {}
