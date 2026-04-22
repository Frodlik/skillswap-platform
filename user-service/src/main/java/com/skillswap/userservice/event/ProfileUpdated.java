package com.skillswap.userservice.event;

import java.util.List;
import java.util.UUID;

public record ProfileUpdated(
        UUID userId,
        List<String> changedFields
) {}
