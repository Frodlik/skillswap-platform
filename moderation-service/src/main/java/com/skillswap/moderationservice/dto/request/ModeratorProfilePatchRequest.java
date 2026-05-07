package com.skillswap.moderationservice.dto.request;

import jakarta.validation.constraints.Size;

public record ModeratorProfilePatchRequest(
        @Size(max = 100) String displayName,
        @Size(max = 5000) String bio
) {}
