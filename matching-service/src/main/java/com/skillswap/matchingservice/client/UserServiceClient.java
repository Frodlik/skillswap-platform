package com.skillswap.matchingservice.client;

import com.skillswap.matchingservice.client.response.UserBriefClientResponse;
import com.skillswap.matchingservice.client.response.UserPreferenceClientResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);

    private final RestClient restClient;

    public UserServiceClient(@Qualifier("userRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    @CircuitBreaker(name = "user-service", fallbackMethod = "defaultBrief")
    public UserBriefClientResponse getBrief(UUID userId) {
        return restClient.get()
                .uri("/internal/users/{id}/brief", userId)
                .retrieve()
                .body(UserBriefClientResponse.class);
    }

    @CircuitBreaker(name = "user-service", fallbackMethod = "defaultPreferences")
    public UserPreferenceClientResponse getPreferences(UUID userId) {
        return restClient.get()
                .uri("/internal/users/{id}/preferences", userId)
                .retrieve()
                .body(UserPreferenceClientResponse.class);
    }

    @CircuitBreaker(name = "user-service", fallbackMethod = "defaultUpdateRating")
    public void updateRating(UUID userId, BigDecimal rating) {
        restClient.patch()
                .uri("/internal/users/{id}/rating", userId)
                .body(new RatingUpdateBody(rating))
                .retrieve()
                .toBodilessEntity();
    }

    private UserBriefClientResponse defaultBrief(UUID userId, Throwable t) {
        log.warn("user-service unavailable for brief userId={}: {}", userId, t.getMessage());
        return new UserBriefClientResponse(userId, null, null, null, null, null);
    }

    private UserPreferenceClientResponse defaultPreferences(UUID userId, Throwable t) {
        log.warn("user-service unavailable for preferences userId={}: {}", userId, t.getMessage());
        return new UserPreferenceClientResponse(userId, List.of(), null, null);
    }

    private void defaultUpdateRating(UUID userId, BigDecimal rating, Throwable t) {
        log.error("user-service unavailable for rating update userId={}: {}", userId, t.getMessage());
    }

    private record RatingUpdateBody(BigDecimal rating) {}
}
