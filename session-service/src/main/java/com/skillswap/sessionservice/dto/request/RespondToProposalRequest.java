package com.skillswap.sessionservice.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

// Body for POST /api/v1/sessions/{id}/accept and /decline.
//
// actorId — the user clicking the button. The service rejects if this
// isn't the invitee (i.e. the participant who is NOT the proposer) — that
// guards against the proposer accepting their own invitation.
//
// In a stricter setup actorId would come from the JWT subject and the
// body wouldn't carry it at all, but the rest of session-service follows
// the same "id-in-body" pattern (see ReviewRequest.reviewerId), so we
// stay consistent.
public record RespondToProposalRequest(@NotNull UUID actorId) {}
