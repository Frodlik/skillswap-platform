package com.skillswap.authservice.service;

import com.skillswap.authservice.config.JwtProperties;
import com.skillswap.authservice.domain.Credentials;
import com.skillswap.authservice.domain.RefreshToken;
import com.skillswap.authservice.domain.Role;
import com.skillswap.authservice.dto.request.LoginRequest;
import com.skillswap.authservice.dto.request.LogoutRequest;
import com.skillswap.authservice.dto.request.RefreshRequest;
import com.skillswap.authservice.dto.request.RegisterRequest;
import com.skillswap.authservice.dto.response.TokenResponse;
import com.skillswap.authservice.event.UserRegisteredEvent;
import com.skillswap.authservice.exception.EmailAlreadyExistsException;
import com.skillswap.authservice.exception.InvalidCredentialsException;
import com.skillswap.authservice.exception.InvalidTokenException;
import com.skillswap.authservice.repository.CredentialsRepository;
import com.skillswap.authservice.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final CredentialsRepository credentialsRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EventPublisher eventPublisher;
    private final long refreshTokenExpirySeconds;

    public AuthService(CredentialsRepository credentialsRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       EventPublisher eventPublisher,
                       JwtProperties jwtProperties) {
        this.credentialsRepository = credentialsRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
        this.refreshTokenExpirySeconds = jwtProperties.refreshTokenExpiry().toSeconds();
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (credentialsRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        var credentials = Credentials.builder()
                .id(UUID.randomUUID())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build();

        credentialsRepository.save(credentials);
        log.info("Registered new user id={}", credentials.getId());

        eventPublisher.publish(new UserRegisteredEvent(
                credentials.getId(), credentials.getEmail(), Instant.now()));

        return issueTokenPair(credentials);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        var credentials = credentialsRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), credentials.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return issueTokenPair(credentials);
    }

    @Transactional
    public TokenResponse refresh(RefreshRequest request) {
        String tokenHash = hashToken(request.refreshToken());

        var stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found"));

        if (!stored.isActive()) {
            throw new InvalidTokenException(
                    stored.isRevoked() ? "Refresh token has been revoked" : "Refresh token has expired");
        }

        // Rotate: revoke old, issue new
        stored.setRevokedAt(Instant.now());
        refreshTokenRepository.save(stored);

        var credentials = credentialsRepository.findById(stored.getUserId())
                .orElseThrow(() -> new InvalidTokenException("User not found"));

        return issueTokenPair(credentials);
    }

    @Transactional
    public void logout(LogoutRequest request) {
        String tokenHash = hashToken(request.refreshToken());

        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
            log.info("Logged out userId={}", token.getUserId());
        });
    }

    // ---- private helpers ----

    private TokenResponse issueTokenPair(Credentials credentials) {
        String accessToken = jwtService.generateAccessToken(
                credentials.getId(), credentials.getRole().name());

        String rawRefreshToken = UUID.randomUUID().toString();
        String tokenHash = hashToken(rawRefreshToken);

        var refreshToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .userId(credentials.getId())
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusSeconds(refreshTokenExpirySeconds))
                .createdAt(Instant.now())
                .build();

        refreshTokenRepository.save(refreshToken);

        return new TokenResponse(accessToken, rawRefreshToken,
                jwtService.getAccessTokenExpirySeconds());
    }

    private String hashToken(String token) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}