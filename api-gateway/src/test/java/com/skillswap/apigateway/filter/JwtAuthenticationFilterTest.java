package com.skillswap.apigateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.apigateway.config.JwtProperties;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtAuthenticationFilterTest {

    private static RSAPublicKey publicKey;
    private static RSAPrivateKey privateKey;

    private JwtAuthenticationFilter filter;

    private static final List<String> PUBLIC_PATHS =
            List.of("/api/v1/auth/**", "/actuator/health", "/actuator/info", "/fallback/**");
    private static final String USER_ID = "550e8400-e29b-41d4-a716-446655440000";

    @BeforeAll
    static void generateKeys() throws Exception {
        KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
        gen.initialize(2048);
        KeyPair pair = gen.generateKeyPair();
        publicKey = (RSAPublicKey) pair.getPublic();
        privateKey = (RSAPrivateKey) pair.getPrivate();
    }

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(
                publicKey,
                new ObjectMapper(),
                new JwtProperties(null, PUBLIC_PATHS)
        );
    }

    private String validToken() {
        return Jwts.builder()
                .subject(USER_ID)
                .claim("role", "USER")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    private String expiredToken() {
        return Jwts.builder()
                .subject(USER_ID)
                .claim("role", "USER")
                .issuedAt(new Date(System.currentTimeMillis() - 120_000))
                .expiration(new Date(System.currentTimeMillis() - 60_000))
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    @Test
    void validToken_shouldInjectUserHeadersAndPassThrough() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/v1/users/me");
        request.addHeader("Authorization", "Bearer " + validToken());
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        HttpServletRequest forwarded = (HttpServletRequest) chain.getRequest();
        assertThat(forwarded.getHeader("X-User-Id")).isEqualTo(USER_ID);
        assertThat(forwarded.getHeader("X-User-Role")).isEqualTo("USER");
    }

    @Test
    void missingAuthHeader_shouldReturn401() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/v1/users/me");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentType()).contains("application/json");
        assertThat(response.getContentAsString()).contains("Missing");
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void invalidBearerFormat_shouldReturn401() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/v1/users/me");
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void expiredToken_shouldReturn401() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/v1/skills/1");
        request.addHeader("Authorization", "Bearer " + expiredToken());
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("Invalid");
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void publicPath_exactMatch_shouldPassWithoutToken() throws Exception {
        var request = new MockHttpServletRequest("GET", "/actuator/health");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void publicPath_wildcardMatch_shouldPassWithoutToken() throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void publicPath_shouldStripSpoofedUserHeaders() throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.addHeader("X-User-Id", "attacker-id");
        request.addHeader("X-User-Role", "ADMIN");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        HttpServletRequest forwarded = (HttpServletRequest) chain.getRequest();
        assertThat(forwarded.getHeader("X-User-Id")).isNull();
        assertThat(forwarded.getHeader("X-User-Role")).isNull();
    }
}