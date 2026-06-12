package com.garagepro.api.dto.imports;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record NfeConfirmItem(
    @NotBlank String supplierCode,
    @NotBlank String description,
    String ncm,
    String cfop,
    String unit,
    @NotNull Integer quantity,
    @NotNull BigDecimal unitCost,
    @NotNull BigDecimal suggestedSalePrice,
    @NotBlank String action,   // create | update | link | ignore
    Long existingPartId
) {}
