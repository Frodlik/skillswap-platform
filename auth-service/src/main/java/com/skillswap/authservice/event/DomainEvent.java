package com.skillswap.authservice.event;

import java.time.Instant;
import java.util.UUID;

public sealed interface DomainEvent permits UserRegisteredEvent {
    UUID userId();
    Instant occurredAt();
}