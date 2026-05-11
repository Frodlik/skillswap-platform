package com.skillswap.sessionservice.dto.request;

import com.skillswap.sessionservice.domain.SessionStatus;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

// actorId — the user clicking the status-change button. Only consulted for
// transitions that require an authorisation check (currently ACTIVE → CANCELLED,
// which is teacher-only — protects the teacher from a learner cancelling
// mid-lesson and forcing a token release after time was already invested).
public record UpdateStatusRequest(@NotNull SessionStatus status,
                                  @NotNull UUID actorId) {}
