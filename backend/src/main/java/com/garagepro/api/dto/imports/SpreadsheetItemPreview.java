package com.garagepro.api.dto.imports;

import java.math.BigDecimal;

public record SpreadsheetItemPreview(
    String description,
    String internalCode,
    String manufacturerCode,
    Integer currentStock,
    BigDecimal averageCost,
    BigDecimal salePrice,
    String supplierName,
    String ncm,
    String status,
    String reason
) {}
