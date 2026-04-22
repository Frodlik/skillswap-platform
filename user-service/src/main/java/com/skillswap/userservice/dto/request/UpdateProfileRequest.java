package com.skillswap.userservice.dto.request;

public record UpdateProfileRequest(
        String displayName,
        String bio,
        String avatarUrl,
        String timezone,
        String language,
        String location
) {}
