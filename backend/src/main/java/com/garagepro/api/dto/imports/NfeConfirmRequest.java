package com.garagepro.api.dto.imports;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record NfeConfirmRequest(
    @NotBlank String fileName,
    @NotBlank String supplierDocument,
    @NotBlank String supplierName,
    @NotBlank String invoiceNumber,
    @NotBlank String issueDate,
    @NotNull BigDecimal totalValue,
    @NotEmpty List<NfeConfirmItem> items
) {}
