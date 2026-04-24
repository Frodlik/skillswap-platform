package com.skillswap.userservice.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RatingUpdateRequest(
        @NotNull @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal rating
) {}
