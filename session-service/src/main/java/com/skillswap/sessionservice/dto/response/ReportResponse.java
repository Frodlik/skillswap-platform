package com.skillswap.sessionservice.dto.response;

import com.skillswap.sessionservice.domain.ReportReason;

import java.time.Instant;
import java.util.UUID;

public record ReportResponse(
        UUID id,
        UUID sessionId,
        UUID reporterId,
        UUID reportedUserId,
        ReportReason reason,
        String comment,
        Instant createdAt,
        boolean resolved
) {}
