package com.skillswap.moderationservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

@RestControllerAdvice
class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        log.debug("{} [{}]: {}", ex.getClass().getSimpleName(), req.getRequestURI(), ex.getMessage());
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage).collect(Collectors.joining(", "));
        return ErrorResponse.of(400, msg, req.getRequestURI());
    }

    @ExceptionHandler(SanctionNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse handleSanctionNotFound(SanctionNotFoundException ex, HttpServletRequest req) {
        return ErrorResponse.of(404, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(ReportNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse handleReportNotFound(ReportNotFoundException ex, HttpServletRequest req) {
        return ErrorResponse.of(404, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    ErrorResponse handleConflict(IllegalStateException ex, HttpServletRequest req) {
        return ErrorResponse.of(409, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        return ErrorResponse.of(400, ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    ErrorResponse handleUnexpected(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {}", req.getRequestURI(), ex);
        return ErrorResponse.of(500, "Internal server error", req.getRequestURI());
    }
}
