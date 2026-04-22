package com.skillswap.userservice.exception;

import java.util.UUID;

public class ProfileNotFoundException extends RuntimeException {
    public ProfileNotFoundException(UUID userId) {
        super("Profile not found for userId=" + userId);
    }

    public ProfileNotFoundException(String message) {
        super(message);
    }
}
