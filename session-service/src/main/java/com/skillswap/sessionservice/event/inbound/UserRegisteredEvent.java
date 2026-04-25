package com.skillswap.sessionservice.event.inbound;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserRegisteredEvent(UUID userId, String email, Instant occurredAt) {}
