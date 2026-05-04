package com.skillswap.sessionservice.dto.request;

import com.skillswap.sessionservice.domain.ReportReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

// Body for POST /api/v1/sessions/{id}/report.
//   reporterId — taken from request body (in production this would come from
//                JWT subject; we mirror the existing ReviewRequest pattern
//                here for consistency with how the rest of the API works).
//   reason     — required enum, see ReportReason for the list.
//   comment    — optional free-text up to 2000 chars; required in spirit when
//                reason is OTHER but we don't enforce that — the moderator
//                will see the empty comment and contact the reporter.
public record SubmitReportRequest(
        @NotNull UUID reporterId,
        @NotNull ReportReason reason,
        @Size(max = 2000) String comment
) {}
