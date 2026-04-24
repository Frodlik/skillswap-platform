package com.skillswap.matchingservice.event.inbound;

import java.math.BigDecimal;
import java.util.UUID;

public record SessionCompletedEvent(
        UUID userAId,
        UUID userBId,
        BigDecimal ratingForA,
        BigDecimal ratingForB
) {}
