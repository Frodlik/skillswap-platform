package com.skillswap.moderationservice.client;

import com.skillswap.moderationservice.dto.request.ModeratorProfilePatchRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);
    private final RestClient restClient;

    public UserServiceClient(@Qualifier("userRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    @CircuitBreaker(name = "user-service", fallbackMethod = "patchProfileFallback")
    public void patchProfile(UUID userId, ModeratorProfilePatchRequest request) {
        restClient.patch()
                .uri("/internal/users/{id}/profile", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (req, res) -> {
                    throw new RuntimeException("user-service returned " + res.getStatusCode());
                })
                .toBodilessEntity();
        log.info("Patched profile for userId={} via user-service", userId);
    }

    void patchProfileFallback(UUID userId, ModeratorProfilePatchRequest request, Throwable t) {
        log.error("user-service unavailable when patching userId={}: {}", userId, t.getMessage());
        throw new RuntimeException("user-service is currently unavailable", t);
    }
}
