package com.skillswap.authservice.service;

import com.skillswap.authservice.config.CookieProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class CookieService {

    static final String ACCESS_TOKEN_COOKIE = "access_token";
    static final String REFRESH_TOKEN_COOKIE = "refresh_token";
    private static final String REFRESH_COOKIE_PATH = "/api/v1/auth";

    private final CookieProperties cookieProperties;

    public CookieService(CookieProperties cookieProperties) {
        this.cookieProperties = cookieProperties;
    }

    public ResponseCookie buildAccessCookie(String token, long maxAgeSeconds) {
        return build(ACCESS_TOKEN_COOKIE, token, "/", maxAgeSeconds);
    }

    public ResponseCookie buildRefreshCookie(String token, long maxAgeSeconds) {
        return build(REFRESH_TOKEN_COOKIE, token, REFRESH_COOKIE_PATH, maxAgeSeconds);
    }

    public ResponseCookie clearAccessCookie() {
        return build(ACCESS_TOKEN_COOKIE, "", "/", 0);
    }

    public ResponseCookie clearRefreshCookie() {
        return build(REFRESH_TOKEN_COOKIE, "", REFRESH_COOKIE_PATH, 0);
    }

    public String extractRefreshToken(HttpServletRequest request) {
        return extractCookie(request, REFRESH_TOKEN_COOKIE);
    }

    public String extractAccessToken(HttpServletRequest request) {
        return extractCookie(request, ACCESS_TOKEN_COOKIE);
    }

    private String extractCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private ResponseCookie build(String name, String value, String path, long maxAgeSeconds) {
        var builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieProperties.secure())
                .sameSite(cookieProperties.sameSite())
                .path(path)
                .maxAge(maxAgeSeconds);

        if (cookieProperties.domain() != null && !cookieProperties.domain().isBlank()) {
            builder = builder.domain(cookieProperties.domain());
        }

        return builder.build();
    }
}
