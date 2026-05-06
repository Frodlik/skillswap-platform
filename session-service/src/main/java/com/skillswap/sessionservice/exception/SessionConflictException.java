package com.skillswap.sessionservice.exception;

// Thrown by SessionService.createSession when the requested time window
// overlaps an existing SCHEDULED or ACTIVE session of teacher or learner.
// Mapped to HTTP 409 Conflict by GlobalExceptionHandler.
//
// The message stays user-friendly (no raw UUIDs) because GlobalExceptionHandler
// surfaces it directly to the client via ErrorResponse.message — the frontend
// renders it inside the schedule-modal error banner.
public class SessionConflictException extends RuntimeException {

    public SessionConflictException(String role) {
        super("Cannot schedule: the " + role + " already has a session at this time.");
    }
}
