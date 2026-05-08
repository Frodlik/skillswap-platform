package com.skillswap.apigateway;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
class FallbackController {

    @RequestMapping("/auth")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> authFallback() {
        return fallbackBody();
    }

    @RequestMapping("/user")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> userFallback() {
        return fallbackBody();
    }

    @RequestMapping("/skill")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> skillFallback() {
        return fallbackBody();
    }

    @RequestMapping("/matching")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> matchingFallback() {
        return fallbackBody();
    }

    @RequestMapping("/session")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> sessionFallback() {
        return fallbackBody();
    }

    @RequestMapping("/moderation")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> moderationFallback() {
        return fallbackBody();
    }

    private Map<String, Object> fallbackBody() {
        return Map.of(
                "status", 503,
                "message", "Service temporarily unavailable. Please try again later.",
                "timestamp", Instant.now().toString()
        );
    }
}