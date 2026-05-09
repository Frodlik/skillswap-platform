package com.skillswap.sessionservice.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

public class DuplicateReportException extends RuntimeException {
    private static final Logger log = LoggerFactory.getLogger(DuplicateReportException.class);

    public DuplicateReportException(UUID sessionId, UUID reporterId) {
        super("You have already submitted a report for this session.");
        log.debug("Duplicate report: sessionId={} reporterId={}", sessionId, reporterId);
    }
}
