package com.skillswap.authservice.service;

import com.skillswap.authservice.config.JwtProperties;
import com.skillswap.authservice.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.converter.RsaKeyConverters;
import org.springframework.stereotype.Service;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String CLAIM_ROLE = "role";

    private final RSAPrivateKey privateKey;
    private final RSAPublicKey publicKey;
    private final long accessTokenExpirySeconds;

    public JwtService(JwtProperties props) {
        try {
            this.privateKey = RsaKeyConverters.pkcs8().convert(
                    props.privateKey().getInputStream());
            this.publicKey = RsaKeyConverters.x509().convert(
                    props.publicKey().getInputStream());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load RSA keys", e);
        }
        this.accessTokenExpirySeconds = props.accessTokenExpiry().toSeconds();
    }

    public String generateAccessToken(UUID userId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_ROLE, role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTokenExpirySeconds)))
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    public Claims validateAndExtract(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException ex) {
            log.debug("JWT validation failed: {}", ex.getMessage());
            throw new InvalidTokenException("Token is invalid or expired");
        }
    }

    public UUID extractUserId(Claims claims) {
        return UUID.fromString(claims.getSubject());
    }

    public String extractRole(Claims claims) {
        return claims.get(CLAIM_ROLE, String.class);
    }

    public long getAccessTokenExpirySeconds() {
        return accessTokenExpirySeconds;
    }
}