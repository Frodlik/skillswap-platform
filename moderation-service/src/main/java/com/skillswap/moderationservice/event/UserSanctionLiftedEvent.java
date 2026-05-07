package com.skillswap.moderationservice.event;

import java.util.UUID;

public record UserSanctionLiftedEvent(UUID userId) {}
