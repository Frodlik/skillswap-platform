package com.skillswap.notificationservice.event;

import java.time.Instant;
import java.util.UUID;

// Mirrors session-service's outbound SessionProposedEvent. Field names and
// JSON layout must match exactly — Jackson binds by field name.
public record SessionProposedEvent(
        UUID sessionId,
        UUID proposerId,
        UUID inviteeId,
        UUID teacherId,
        UUID learnerId,
        String skillName,
        Instant scheduledAt,
        int durationTokens
) {}
