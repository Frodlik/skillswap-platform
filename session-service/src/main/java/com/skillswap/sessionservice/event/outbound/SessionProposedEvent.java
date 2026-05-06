package com.skillswap.sessionservice.event.outbound;

import java.time.Instant;
import java.util.UUID;

// Fired when a new session is created (status PROPOSED). Notification-service
// uses inviteeId to send an email asking them to accept/decline. Carries
// enough context (skillName, scheduledAt, durationTokens) for the email body
// without forcing the listener to round-trip back to session-service.
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
