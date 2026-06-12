package com.garagepro.api.dto.stockmovement;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record StockMovementRequest(
    @NotNull                   Long partId,
    @NotBlank                  String type,
    @NotNull @Min(1)           Integer quantity,
    BigDecimal unitCost,
    String relatedServiceOrderNumber,
    String supplierName,
    @NotBlank                  String userName,
    String reason
) {}
