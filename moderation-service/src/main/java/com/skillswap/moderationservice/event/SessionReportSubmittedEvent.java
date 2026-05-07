package com.skillswap.moderationservice.event;

import java.util.UUID;

public record SessionReportSubmittedEvent(
        UUID sessionReportId, UUID reporterId, UUID reportedUserId,
        String reason, String comment
) {}
