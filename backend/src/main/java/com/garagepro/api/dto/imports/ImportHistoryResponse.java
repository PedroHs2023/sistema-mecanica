package com.garagepro.api.dto.imports;

import com.garagepro.api.entity.ImportHistory;

import java.time.LocalDateTime;

public record ImportHistoryResponse(
    Long id,
    String type,
    String fileName,
    int itemsFound,
    int created,
    int updated,
    int ignored,
    String status,
    LocalDateTime importedAt
) {
    public static ImportHistoryResponse from(ImportHistory h) {
        return new ImportHistoryResponse(
            h.getId(), h.getType().name(), h.getFileName(),
            h.getItemsFound(), h.getCreatedCount(), h.getUpdatedCount(),
            h.getIgnoredCount(), h.getStatus().name(), h.getImportedAt()
        );
    }
}
