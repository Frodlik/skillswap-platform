package com.skillswap.authservice.dto.response;

import java.util.UUID;

public record ValidateResponse(
        UUID userId,
        String role
) {}