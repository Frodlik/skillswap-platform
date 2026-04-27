package com.skillswap.matchingservice;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.skillswap.matchingservice.config.TestRestClientConfig;
import com.skillswap.matchingservice.domain.KnownUser;
import com.skillswap.matchingservice.domain.Match;
import com.skillswap.matchingservice.domain.MatchStatus;
import com.skillswap.matchingservice.dto.response.MatchSuggestion;
import com.skillswap.matchingservice.repository.KnownUserRepository;
import com.skillswap.matchingservice.repository.MatchRepository;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
@Import(TestRestClientConfig.class)
class MatchingServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine").withDatabaseName("matching_test");

    @Container
    static RabbitMQContainer rabbitmq = new RabbitMQContainer("rabbitmq:3-management");

    static WireMockServer wireMock;

    @BeforeAll
    static void startWireMock() {
        wireMock = new WireMockServer(WireMockConfiguration.options().dynamicPort());
        wireMock.start();
    }

    @AfterAll
    static void stopWireMock() {
        if (wireMock != null) wireMock.stop();
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.rabbitmq.host", rabbitmq::getHost);
        registry.add("spring.rabbitmq.port", rabbitmq::getAmqpPort);
        registry.add("services.user-service.base-url",
                () -> "http://localhost:" + wireMock.port());
        registry.add("services.skill-service.base-url",
                () -> "http://localhost:" + wireMock.port());
        registry.add("eureka.client.enabled", () -> "false");
        registry.add("spring.cloud.discovery.enabled", () -> "false");
    }

    @LocalServerPort
    int port;

    @Autowired
    KnownUserRepository knownUserRepository;

    @Autowired
    MatchRepository matchRepository;

    RestClient client;

    @BeforeEach
    void cleanUp() {
        matchRepository.deleteAll();
        knownUserRepository.deleteAll();
        wireMock.resetAll();
        client = RestClient.builder().baseUrl("http://localhost:" + port).build();
    }

    @Test
    void getSuggestions_returnsPreComputedMatchesOrderedByScore() {
        UUID userId = UUID.randomUUID();
        UUID candidate1 = UUID.randomUUID();
        UUID candidate2 = UUID.randomUUID();

        knownUserRepository.save(new KnownUser(userId, Instant.now()));
        knownUserRepository.save(new KnownUser(candidate1, Instant.now()));
        knownUserRepository.save(new KnownUser(candidate2, Instant.now()));

        matchRepository.save(Match.builder().id(UUID.randomUUID())
                .userAId(userId).userBId(candidate1).totalScore(0.85)
                .scoreBreakdown("{\"details\":[]}").status(MatchStatus.PENDING)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS)).build());
        matchRepository.save(Match.builder().id(UUID.randomUUID())
                .userAId(userId).userBId(candidate2).totalScore(0.65)
                .scoreBreakdown("{\"details\":[]}").status(MatchStatus.PENDING)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS)).build());

        ResponseEntity<MatchSuggestion[]> response = client.get()
                .uri("/api/v1/matches/suggestions/{id}?limit=10", userId)
                .retrieve()
                .toEntity(MatchSuggestion[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody()[0].totalScore())
                .isGreaterThan(response.getBody()[1].totalScore());
    }

    @Test
    void acceptMatch_changesStatusToAccepted() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();
        UUID matchId = UUID.randomUUID();

        matchRepository.save(Match.builder().id(matchId)
                .userAId(userId).userBId(candidateId).totalScore(0.75)
                .scoreBreakdown("{\"details\":[]}").status(MatchStatus.PENDING)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS)).build());

        ResponseEntity<Object> response = client.post()
                .uri("/api/v1/matches/{id}/accept", matchId)
                .retrieve()
                .toEntity(Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(matchRepository.findById(matchId))
                .isPresent()
                .hasValueSatisfying(m -> assertThat(m.getStatus()).isEqualTo(MatchStatus.ACCEPTED));
    }

    @Test
    void getSuggestions_returnsEmptyForUnknownUser() {
        UUID unknownUser = UUID.randomUUID();

        ResponseEntity<MatchSuggestion[]> response = client.get()
                .uri("/api/v1/matches/suggestions/{id}", unknownUser)
                .retrieve()
                .toEntity(MatchSuggestion[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    void computeScore_debugEndpointCallsExternalServices() {
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();
        stubUser(userA);
        stubUser(userB);

        ResponseEntity<Object> response = client.get()
                .uri("/internal/match/score/{a}/{b}", userA, userB)
                .retrieve()
                .toEntity(Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    private void stubUser(UUID id) {
        wireMock.stubFor(get(urlPathEqualTo("/internal/users/" + id + "/brief"))
                .willReturn(aResponse().withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"userId\":\"" + id + "\",\"displayName\":\"User\","
                                + "\"avatarUrl\":null,\"rating\":4.0,"
                                + "\"language\":\"EN\",\"timezone\":\"UTC\"}")));
        wireMock.stubFor(get(urlPathEqualTo("/internal/users/" + id + "/preferences"))
                .willReturn(aResponse().withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"userId\":\"" + id + "\",\"preferredLanguages\":[\"EN\"],"
                                + "\"preferredTimezoneRange\":null,\"availabilitySchedule\":null}")));
        wireMock.stubFor(get(urlPathEqualTo("/internal/skills/user/" + id))
                .willReturn(aResponse().withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("[]")));
    }
}
