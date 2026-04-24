package com.skillswap.matchingservice.client.response;

import java.util.List;
import java.util.UUID;

public record UserPreferenceClientResponse(
        UUID userId,
        List<String> preferredLanguages,
        String preferredTimezoneRange,
        String availabilitySchedule
) {}
