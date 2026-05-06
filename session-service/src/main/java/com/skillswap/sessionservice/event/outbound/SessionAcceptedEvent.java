package com.skillswap.sessionservice.event.outbound;

import java.time.Instant;
import java.util.UUID;

// Fired when an invitee accepts a PROPOSED session (status SCHEDULED).
// Notification-service emails the proposer ("they accepted, here's the
// Jitsi link / calendar slot reminder").
public record SessionAcceptedEvent(
        UUID sessionId,
        UUID proposerId,
        UUID inviteeId,
        String skillName,
        Instant scheduledAt
) {}
