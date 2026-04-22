package com.skillswap.authservice.controller;

import com.skillswap.authservice.dto.response.ValidateResponse;
import com.skillswap.authservice.exception.InvalidTokenException;
import com.skillswap.authservice.service.JwtService;
import io.jsonwebtoken.Claims;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/internal/auth")
@AllArgsConstructor
public class InternalController {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    @GetMapping("/validate")
    ValidateResponse validate(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw new InvalidTokenException("Missing or malformed Authorization header");
        }

        String token = header.substring(BEARER_PREFIX.length());
        Claims claims = jwtService.validateAndExtract(token);

        return new ValidateResponse(
                jwtService.extractUserId(claims),
                jwtService.extractRole(claims));
    }
}