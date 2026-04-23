package com.skillswap.skillservice.dto.response;

import java.util.List;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String icon,
        List<CategoryResponse> children
) {}
