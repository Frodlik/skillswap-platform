package com.skillswap.authservice.event;

import java.time.Instant;
import java.util.UUID;

public record UserSanctionedEvent(UUID userId, String type, Instant expiresAt) {}
