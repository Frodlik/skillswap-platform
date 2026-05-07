package com.skillswap.sessionservice.event.outbound;

import java.util.UUID;

public record ReportSubmittedEvent(
        UUID sessionReportId,
        UUID reporterId,
        UUID reportedUserId,
        String reason,
        String comment
) {}
