package com.skillswap.matchingservice.event.inbound;

import java.util.List;
import java.util.UUID;

public record ProfileUpdatedEvent(UUID userId, List<String> changedFields) {}
