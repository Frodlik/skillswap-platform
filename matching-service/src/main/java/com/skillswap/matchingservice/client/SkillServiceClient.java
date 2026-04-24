package com.skillswap.matchingservice.client;

import com.skillswap.matchingservice.client.response.SkillClientResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.UUID;

@Component
public class SkillServiceClient {

    private static final Logger log = LoggerFactory.getLogger(SkillServiceClient.class);

    private final RestClient restClient;

    public SkillServiceClient(@Qualifier("skillRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    @CircuitBreaker(name = "skill-service", fallbackMethod = "emptySkills")
    public List<SkillClientResponse> getUserSkills(UUID userId) {
        return restClient.get()
                .uri("/internal/skills/user/{id}", userId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    private List<SkillClientResponse> emptySkills(UUID userId, Throwable t) {
        log.warn("skill-service unavailable for userId={}: {}", userId, t.getMessage());
        return List.of();
    }
}
