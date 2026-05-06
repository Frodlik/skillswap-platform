package com.skillswap.sessionservice.event.outbound;

import java.util.UUID;

// Fired when an invitee declines a PROPOSED session (status REJECTED) OR
// when the lifecycle scheduler auto-cancels a stale PROPOSED that ran past
// its scheduledAt without a response. Notification-service emails the
// proposer so they know to look elsewhere.
public record SessionDeclinedEvent(
        UUID sessionId,
        UUID proposerId,
        UUID inviteeId,
        String skillName,
        boolean autoExpired   // true when the scheduler cancelled, false on explicit decline
) {}
