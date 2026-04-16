package com.skillswap.authservice.service;

import com.skillswap.authservice.config.JwtProperties;
import com.skillswap.authservice.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() throws Exception {
        KeyPair keyPair = generateRsaKeyPair();
        JwtProperties props = new JwtProperties(
                toPkcs8Pem((RSAPrivateKey) keyPair.getPrivate()),
                toX509Pem((RSAPublicKey) keyPair.getPublic()),
                Duration.ofMinutes(15),
                Duration.ofDays(7));
        jwtService = new JwtService(props);
    }

    @Test
    void generateAccessToken_returnsSignedToken() {
        UUID userId = UUID.randomUUID();

        String token = jwtService.generateAccessToken(userId, "USER");

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // header.payload.signature
    }

    @Test
    void validateAndExtract_validToken_returnsClaims() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateAccessToken(userId, "ADMIN");

        Claims claims = jwtService.validateAndExtract(token);

        assertThat(jwtService.extractUserId(claims)).isEqualTo(userId);
        assertThat(jwtService.extractRole(claims)).isEqualTo("ADMIN");
    }

    @Test
    void validateAndExtract_tamperedToken_throwsInvalidTokenException() {
        String token = jwtService.generateAccessToken(UUID.randomUUID(), "USER");
        String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";

        assertThatThrownBy(() -> jwtService.validateAndExtract(tampered))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("invalid or expired");
    }

    @Test
    void validateAndExtract_randomString_throwsInvalidTokenException() {
        assertThatThrownBy(() -> jwtService.validateAndExtract("not.a.jwt"))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void getAccessTokenExpirySeconds_returns900() {
        assertThat(jwtService.getAccessTokenExpirySeconds()).isEqualTo(900L);
    }

    // ---- helpers ----

    private KeyPair generateRsaKeyPair() throws Exception {
        KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
        gen.initialize(2048);
        return gen.generateKeyPair();
    }

    private ByteArrayResource toPkcs8Pem(RSAPrivateKey key) {
        String pem = "-----BEGIN PRIVATE KEY-----\n"
                + Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(key.getEncoded())
                + "\n-----END PRIVATE KEY-----\n";
        return new ByteArrayResource(pem.getBytes());
    }

    private ByteArrayResource toX509Pem(RSAPublicKey key) {
        String pem = "-----BEGIN PUBLIC KEY-----\n"
                + Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(key.getEncoded())
                + "\n-----END PUBLIC KEY-----\n";
        return new ByteArrayResource(pem.getBytes());
    }
}