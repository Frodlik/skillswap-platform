package com.skillswap.apigateway;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
class FallbackController {

    @GetMapping("/auth")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> authFallback() {
        return fallbackBody("auth-service");
    }

    @GetMapping("/user")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> userFallback() {
        return fallbackBody("user-service");
    }

    @GetMapping("/skill")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> skillFallback() {
        return fallbackBody("skill-service");
    }

    @GetMapping("/matching")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> matchingFallback() {
        return fallbackBody("matching-service");
    }

    @GetMapping("/session")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, Object> sessionFallback() {
        return fallbackBody("session-service");
    }

    private Map<String, Object> fallbackBody(String service) {
        return Map.of(
                "status", 503,
                "message", service + " is temporarily unavailable",
                "timestamp", Instant.now().toString()
        );
    }
}