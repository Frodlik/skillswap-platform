package com.skillswap.userservice.dto.response;

import java.util.UUID;

public record PreferenceResponse(
        UUID userId,
        String[] preferredLanguages,
        String preferredTimezoneRange,
        String availabilitySchedule
) {}
