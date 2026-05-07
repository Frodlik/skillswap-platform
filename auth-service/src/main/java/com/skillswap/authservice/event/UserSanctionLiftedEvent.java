package com.skillswap.authservice.event;

import java.util.UUID;

public record UserSanctionLiftedEvent(UUID userId) {}
