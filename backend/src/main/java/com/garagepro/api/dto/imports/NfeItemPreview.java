package com.garagepro.api.dto.imports;

import java.math.BigDecimal;

public record NfeItemPreview(
    String supplierCode,
    String description,
    String ncm,
    String cfop,
    String unit,
    Integer quantity,
    BigDecimal unitCost,
    BigDecimal totalCost,
    BigDecimal suggestedSalePrice,
    double marginPercent,
    String status,
    Long possibleMatchPartId,
    String possibleMatchDescription
) {}
