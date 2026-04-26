package com.skillswap.sessionservice.dto.response;

import java.util.UUID;

public record WalletBalanceResponse(
        UUID userId,
        int balance,
        int heldBalance,
        int total
) {}
