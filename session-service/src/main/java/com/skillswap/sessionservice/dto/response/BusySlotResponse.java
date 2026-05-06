package com.skillswap.sessionservice.dto.response;

import java.time.Instant;

// Privacy-preserving session timing for the schedule-calendar widget.
// Only carries the slot dimensions — no skill name, no participants —
// so anyone in the platform can know "this user is busy at time X for
// Y hours" without leaking what they're doing or with whom.
public record BusySlotResponse(Instant scheduledAt, int durationTokens) {}
