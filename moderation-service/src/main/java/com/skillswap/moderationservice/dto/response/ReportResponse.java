package com.skillswap.moderationservice.dto.response;

import com.skillswap.moderationservice.domain.ContentReportStatus;
import java.time.Instant;
import java.util.UUID;

public record ReportResponse(
        UUID id, UUID sourceId, UUID reporterId, UUID reportedUserId,
        String reason, String comment, ContentReportStatus status,
        UUID resolvedBy, Instant resolvedAt, Instant createdAt
) {}
