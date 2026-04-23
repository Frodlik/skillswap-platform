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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock CredentialsRepository credentialsRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock JwtService jwtService;
    @Mock
    ApplicationEventPublisher eventPublisher;

    private AuthService authService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties(null, null,
                Duration.ofMinutes(15), Duration.ofDays(7));
        authService = new AuthService(
                credentialsRepository, refreshTokenRepository,
                jwtService, passwordEncoder, eventPublisher, props);
    }

    // ---- register ----

    @Nested
    class Register {

        @Test
        void happyPath_savesCredentialsAndPublishesEvent() {
            when(credentialsRepository.existsByEmail("user@test.com")).thenReturn(false);
            when(jwtService.generateAccessToken(any(), anyString())).thenReturn("access.token");
            when(jwtService.getAccessTokenExpirySeconds()).thenReturn(900L);
            when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            TokenResponse response = authService.register(
                    new RegisterRequest("user@test.com", "password123"));

            assertThat(response.accessToken()).isEqualTo("access.token");
            assertThat(response.refreshToken()).isNotBlank();
            assertThat(response.expiresIn()).isEqualTo(900L);

            ArgumentCaptor<Credentials> credCap = ArgumentCaptor.forClass(Credentials.class);
            verify(credentialsRepository).save(credCap.capture());
            assertThat(credCap.getValue().getEmail()).isEqualTo("user@test.com");
            assertThat(credCap.getValue().getRole()).isEqualTo(Role.USER);
            assertThat(passwordEncoder.matches("password123",
                    credCap.getValue().getPasswordHash())).isTrue();

            ArgumentCaptor<UserRegisteredEvent> eventCap =
                    ArgumentCaptor.forClass(UserRegisteredEvent.class);
            verify(eventPublisher).publishEvent(eventCap.capture());
            assertThat(eventCap.getValue().email()).isEqualTo("user@test.com");
        }

        @Test
        void duplicateEmail_throwsEmailAlreadyExistsException() {
            when(credentialsRepository.existsByEmail("dup@test.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(
                    new RegisterRequest("dup@test.com", "password123")))
                    .isInstanceOf(EmailAlreadyExistsException.class);

            verify(credentialsRepository, never()).save(any());
            verify(eventPublisher, never()).publishEvent(any());
        }
    }

    // ---- login ----

    @Nested
    class Login {

        @Test
        void validCredentials_returnsTokenResponse() {
            UUID userId = UUID.randomUUID();
            String hash = passwordEncoder.encode("secret");
            Credentials creds = buildCredentials(userId, "login@test.com", hash);

            when(credentialsRepository.findByEmail("login@test.com")).thenReturn(Optional.of(creds));
            when(jwtService.generateAccessToken(userId, "USER")).thenReturn("at");
            when(jwtService.getAccessTokenExpirySeconds()).thenReturn(900L);

            TokenResponse response = authService.login(new LoginRequest("login@test.com", "secret"));

            assertThat(response.accessToken()).isEqualTo("at");
        }

        @Test
        void unknownEmail_throwsInvalidCredentialsException() {
            when(credentialsRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(
                    new LoginRequest("ghost@test.com", "pass")))
                    .isInstanceOf(InvalidCredentialsException.class);
        }

        @Test
        void wrongPassword_throwsInvalidCredentialsException() {
            UUID userId = UUID.randomUUID();
            String hash = passwordEncoder.encode("correct");
            Credentials creds = buildCredentials(userId, "pw@test.com", hash);

            when(credentialsRepository.findByEmail("pw@test.com")).thenReturn(Optional.of(creds));

            assertThatThrownBy(() -> authService.login(
                    new LoginRequest("pw@test.com", "wrong")))
                    .isInstanceOf(InvalidCredentialsException.class);
        }
    }

    // ---- refresh ----

    @Nested
    class Refresh {

        @Test
        void activeToken_rotatesAndReturnsNewPair() {
            UUID userId = UUID.randomUUID();
            String rawToken = UUID.randomUUID().toString();
            Credentials creds = buildCredentials(userId, "r@test.com",
                    passwordEncoder.encode("x"));

            RefreshToken stored = buildRefreshToken(userId, rawToken, false, false);

            when(refreshTokenRepository.findByTokenHash(anyString()))
                    .thenReturn(Optional.of(stored));
            when(credentialsRepository.findById(userId)).thenReturn(Optional.of(creds));
            when(jwtService.generateAccessToken(userId, "USER")).thenReturn("new.at");
            when(jwtService.getAccessTokenExpirySeconds()).thenReturn(900L);

            TokenResponse response = authService.refresh(new RefreshRequest(rawToken));

            assertThat(response.accessToken()).isEqualTo("new.at");
            assertThat(stored.getRevokedAt()).isNotNull();   // old token revoked
        }

        @Test
        void revokedToken_throwsInvalidTokenException() {
            String rawToken = UUID.randomUUID().toString();
            RefreshToken stored = buildRefreshToken(UUID.randomUUID(), rawToken, true, false);

            when(refreshTokenRepository.findByTokenHash(anyString()))
                    .thenReturn(Optional.of(stored));

            assertThatThrownBy(() -> authService.refresh(new RefreshRequest(rawToken)))
                    .isInstanceOf(InvalidTokenException.class)
                    .hasMessageContaining("revoked");
        }

        @Test
        void expiredToken_throwsInvalidTokenException() {
            String rawToken = UUID.randomUUID().toString();
            RefreshToken stored = buildRefreshToken(UUID.randomUUID(), rawToken, false, true);

            when(refreshTokenRepository.findByTokenHash(anyString()))
                    .thenReturn(Optional.of(stored));

            assertThatThrownBy(() -> authService.refresh(new RefreshRequest(rawToken)))
                    .isInstanceOf(InvalidTokenException.class)
                    .hasMessageContaining("expired");
        }

        @Test
        void unknownToken_throwsInvalidTokenException() {
            when(refreshTokenRepository.findByTokenHash(anyString()))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refresh(
                    new RefreshRequest(UUID.randomUUID().toString())))
                    .isInstanceOf(InvalidTokenException.class);
        }
    }

    // ---- logout ----

    @Nested
    class Logout {

        @Test
        void knownToken_revokesIt() {
            String rawToken = UUID.randomUUID().toString();
            RefreshToken stored = buildRefreshToken(UUID.randomUUID(), rawToken, false, false);

            when(refreshTokenRepository.findByTokenHash(anyString()))
                    .thenReturn(Optional.of(stored));

            authService.logout(new LogoutRequest(rawToken));

            assertThat(stored.getRevokedAt()).isNotNull();
            verify(refreshTokenRepository).save(stored);
        }

        @Test
        void unknownToken_doesNothingGracefully() {
            when(refreshTokenRepository.findByTokenHash(anyString()))
                    .thenReturn(Optional.empty());

            authService.logout(new LogoutRequest(UUID.randomUUID().toString()));

            verify(refreshTokenRepository, never()).save(any());
        }
    }

    // ---- helpers ----

    private Credentials buildCredentials(UUID id, String email, String hash) {
        return Credentials.builder()
                .id(id).email(email).passwordHash(hash).role(Role.USER).build();
    }

    private RefreshToken buildRefreshToken(UUID userId, String rawToken,
                                           boolean revoked, boolean expired) {
        return RefreshToken.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .tokenHash(rawToken)
                .expiresAt(expired ? Instant.now().minusSeconds(1) : Instant.now().plusSeconds(600))
                .revokedAt(revoked ? Instant.now().minusSeconds(10) : null)
                .createdAt(Instant.now())
                .build();
    }
}