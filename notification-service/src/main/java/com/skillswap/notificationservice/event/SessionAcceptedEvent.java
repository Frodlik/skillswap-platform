package com.skillswap.notificationservice.event;

import java.time.Instant;
import java.util.UUID;

public record SessionAcceptedEvent(
        UUID sessionId,
        UUID proposerId,
        UUID inviteeId,
        String skillName,
        Instant scheduledAt
) {}
