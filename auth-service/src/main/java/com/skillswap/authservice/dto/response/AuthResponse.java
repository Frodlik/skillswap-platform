package com.skillswap.authservice.dto.response;

public record AuthResponse(String userId, String role, long expiresIn) {}
