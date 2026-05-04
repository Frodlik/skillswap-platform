package com.skillswap.notificationservice.event;

import java.time.Instant;
import java.util.UUID;

// Mirrors auth-service's UserRegisteredEvent record. We can't share types
// across modules (they're separate Spring Boot apps with isolated classpaths),
// so the field names + JSON layout must match exactly for Jackson to bind.
public record UserRegisteredEvent(
        UUID userId,
        String email,
        Instant occurredAt
) {}
