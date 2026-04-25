package com.skillswap.sessionservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({SessionNotFoundException.class, WalletNotFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse handleNotFound(RuntimeException ex, HttpServletRequest req) {
        return new ErrorResponse(404, ex.getMessage(), req.getRequestURI(), Instant.now());
    }

    @ExceptionHandler(InsufficientBalanceException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    ErrorResponse handleInsufficient(InsufficientBalanceException ex, HttpServletRequest req) {
        return new ErrorResponse(422, ex.getMessage(), req.getRequestURI(), Instant.now());
    }

    @ExceptionHandler(DuplicateReviewException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    ErrorResponse handleDuplicate(DuplicateReviewException ex, HttpServletRequest req) {
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
        return new ErrorResponse(500, ex.getMessage(), req.getRequestURI(), Instant.now());
    }
}
