package com.skillswap.notificationservice.event;

import java.util.UUID;

public record SessionCompletedEvent(
        UUID sessionId,
        UUID teacherId,
        UUID learnerId,
        Integer ratingForTeacher,
        Integer ratingForLearner
) {}
