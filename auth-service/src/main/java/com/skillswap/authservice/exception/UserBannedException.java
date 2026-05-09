package com.skillswap.authservice.exception;

import java.util.UUID;

public class UserBannedException extends RuntimeException {
    public UserBannedException(UUID userId) {
        super("Your account is currently suspended.");
    }
}
