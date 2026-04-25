package com.skillswap.sessionservice.dto.response;

import com.skillswap.sessionservice.domain.TransactionType;

import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        UUID walletId,
        int amount,
        TransactionType type,
        UUID referenceId,
        String description,
        Instant createdAt
) {}
