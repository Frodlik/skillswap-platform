package com.skillswap.notificationservice.event;

import java.util.UUID;

public record SessionDeclinedEvent(
        UUID sessionId,
        UUID proposerId,
        UUID inviteeId,
        String skillName,
        boolean autoExpired
) {}
