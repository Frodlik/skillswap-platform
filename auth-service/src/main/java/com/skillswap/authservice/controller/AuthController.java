package com.skillswap.authservice.controller;

import com.skillswap.authservice.config.JwtProperties;
import com.skillswap.authservice.dto.request.LoginRequest;
import com.skillswap.authservice.dto.request.RegisterRequest;
import com.skillswap.authservice.dto.response.AuthResponse;
import com.skillswap.authservice.dto.response.TokenResponse;
import com.skillswap.authservice.exception.InvalidTokenException;
import com.skillswap.authservice.service.AuthService;
import com.skillswap.authservice.service.CookieService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@AllArgsConstructor
@Tag(name = "Auth", description = "Registration, login, token refresh, logout")
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;
    private final JwtProperties jwtProperties;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        TokenResponse tokens = authService.register(request);
        writeTokenCookies(response, tokens);
        return new AuthResponse(tokens.userId().toString(), tokens.role(), tokens.expiresIn());
    }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        TokenResponse tokens = authService.login(request);
        writeTokenCookies(response, tokens);
        return new AuthResponse(tokens.userId().toString(), tokens.role(), tokens.expiresIn());
    }

    @PostMapping("/refresh")
    AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieService.extractRefreshToken(request);
        if (refreshToken == null) {
            throw new InvalidTokenException("Refresh token cookie is missing");
        }
        TokenResponse tokens = authService.refresh(refreshToken);
        writeTokenCookies(response, tokens);
        return new AuthResponse(tokens.userId().toString(), tokens.role(), tokens.expiresIn());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieService.extractRefreshToken(request);
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        clearTokenCookies(response);
    }

    private void writeTokenCookies(HttpServletResponse response, TokenResponse tokens) {
        long refreshMaxAge = jwtProperties.refreshTokenExpiry().toSeconds();
        response.addHeader(HttpHeaders.SET_COOKIE,
                cookieService.buildAccessCookie(tokens.accessToken(), tokens.expiresIn()).toString());
        response.addHeader(HttpHeaders.SET_COOKIE,
                cookieService.buildRefreshCookie(tokens.refreshToken(), refreshMaxAge).toString());
    }

    private void clearTokenCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearAccessCookie().toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearRefreshCookie().toString());
    }
}