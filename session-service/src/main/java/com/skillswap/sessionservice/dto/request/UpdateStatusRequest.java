package com.skillswap.sessionservice.dto.request;

import com.skillswap.sessionservice.domain.SessionStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull SessionStatus status) {}
