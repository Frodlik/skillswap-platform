package com.skillswap.sessionservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

// proposerId — who clicked "Send invitation" in the UI. MUST equal either
// teacherId or learnerId; the OTHER one becomes the invitee who needs to
// accept/decline before the session moves out of PROPOSED state. The
// service rejects requests where proposerId isn't a participant.
public record CreateSessionRequest(
        @NotNull UUID matchId,
        @NotNull UUID teacherId,
        @NotNull UUID learnerId,
        @NotNull UUID proposerId,
        @NotBlank String skillName,
        @NotNull Instant scheduledAt,
        @Min(1) int durationTokens
) {}
