package com.garagepro.api.dto.imports;

import java.util.List;

public record SpreadsheetImportPreviewResponse(
    String fileName,
    int totalRows,
    int readyCount,
    int duplicateCount,
    int incompleteCount,
    List<SpreadsheetItemPreview> items
) {}
