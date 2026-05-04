package com.skillswap.sessionservice.exception;

import java.util.UUID;

public class DuplicateReportException extends RuntimeException {
    public DuplicateReportException(UUID sessionId, UUID reporterId) {
        super("Report already exists for session=" + sessionId + " reporter=" + reporterId);
    }
}
