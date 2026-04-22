package com.skillswap.userservice.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record UserBriefResponse(
        UUID userId,
        String displayName,
        String avatarUrl,
        BigDecimal rating
) {}
