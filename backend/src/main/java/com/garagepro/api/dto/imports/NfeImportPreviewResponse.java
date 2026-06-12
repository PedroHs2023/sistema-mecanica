package com.garagepro.api.dto.imports;

import java.math.BigDecimal;
import java.util.List;

public record NfeImportPreviewResponse(
    String invoiceNumber,
    String series,
    String accessKey,
    String supplierName,
    String supplierDocument,
    String issueDate,
    BigDecimal totalValue,
    List<NfeItemPreview> items
) {}
