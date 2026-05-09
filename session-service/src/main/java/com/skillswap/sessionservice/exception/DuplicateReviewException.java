package com.skillswap.sessionservice.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

public class DuplicateReviewException extends RuntimeException {
    private static final Logger log = LoggerFactory.getLogger(DuplicateReviewException.class);

    public DuplicateReviewException(UUID sessionId, UUID reviewerId) {
        super("You have already submitted a review for this session.");
        log.debug("Duplicate review: sessionId={} reviewerId={}", sessionId, reviewerId);
    }
}
