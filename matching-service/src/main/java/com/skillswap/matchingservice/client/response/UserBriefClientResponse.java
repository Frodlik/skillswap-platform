package com.skillswap.matchingservice.client.response;

import java.math.BigDecimal;
import java.util.UUID;

public record UserBriefClientResponse(
        UUID userId,
        String displayName,
        String avatarUrl,
        BigDecimal rating,
        String language,
        String timezone
) {}
