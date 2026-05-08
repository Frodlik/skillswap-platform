package com.skillswap.sessionservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler({SessionNotFoundException.class, WalletNotFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse handleNotFound(RuntimeException ex, HttpServletRequest req) {
        log.debug("Not found [{}]: {}", req.getRequestURI(), ex.toString());
        return new ErrorResponse(404, ex.getMessage(), req.getRequestURI(), Instant.now());
    }

    @ExceptionHandler(InsufficientBalanceException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_CONTENT)
    ErrorResponse handleInsufficient(InsufficientBalanceException ex, HttpServletRequest req) {
        return new ErrorResponse(422, ex.getMessage(), req.getRequestURI(), Instant.now());
    }

    @ExceptionHandler({DuplicateReviewException.class, DuplicateReportException.class,
            SessionConflictException.class})
    @ResponseStatus(HttpStatus.CONFLICT)
    ErrorResponse handleDuplicate(RuntimeException ex, HttpServletRequest req) {
        return new ErrorResponse(409, ex.getMessage(), req.getRequestURI(), Instant.now());
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    ErrorResponse handleIllegalState(IllegalStateException ex, HttpServletRequest req) {
        return new ErrorResponse(409, ex.getMessage(), req.getRequestURI(), Instant.now());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse handleBadRequest(IllegalArgumentException ex, HttpServletRequest req) {
        return new ErrorResponse(400, ex.getMessage(), req.getRequestURI(), Instant.now());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    ErrorResponse handleGeneral(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {}", req.getRequestURI(), ex);
        return new ErrorResponse(500, "Internal server error", req.getRequestURI(), Instant.now());
    }
}
