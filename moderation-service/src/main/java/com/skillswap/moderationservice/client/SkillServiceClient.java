package com.skillswap.moderationservice.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class SkillServiceClient {

    private static final Logger log = LoggerFactory.getLogger(SkillServiceClient.class);
    private final RestClient restClient;

    public SkillServiceClient(@Qualifier("skillRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    @CircuitBreaker(name = "skill-service", fallbackMethod = "deleteSkillFallback")
    public void deleteSkill(UUID skillId) {
        restClient.delete()
                .uri("/internal/skills/{id}", skillId)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (req, res) -> {
                    throw new RuntimeException("skill-service returned " + res.getStatusCode());
                })
                .toBodilessEntity();
        log.info("Deleted skill skillId={} via skill-service", skillId);
    }

    void deleteSkillFallback(UUID skillId, Throwable t) {
        log.error("skill-service unavailable when deleting skillId={}: {}", skillId, t.getMessage());
        throw new RuntimeException("skill-service is currently unavailable", t);
    }
}
