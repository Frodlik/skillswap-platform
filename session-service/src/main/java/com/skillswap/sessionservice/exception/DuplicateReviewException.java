package com.skillswap.sessionservice.exception;

import java.util.UUID;

public class DuplicateReviewException extends RuntimeException {
    public DuplicateReviewException(UUID sessionId, UUID reviewerId) {
        super("Review already exists for session=" + sessionId + " reviewer=" + reviewerId);
    }
}
