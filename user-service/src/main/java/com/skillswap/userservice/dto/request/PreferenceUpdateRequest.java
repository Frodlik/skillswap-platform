package com.skillswap.userservice.dto.request;

public record PreferenceUpdateRequest(
        String[] preferredLanguages,
        String preferredTimezoneRange,
        String availabilitySchedule
) {}
