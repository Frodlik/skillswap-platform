package com.skillswap.moderationservice.exception;

import java.util.UUID;

public class SanctionNotFoundException extends RuntimeException {
    public SanctionNotFoundException(UUID id) {
        super("Sanction not found: " + id);
    }
}
