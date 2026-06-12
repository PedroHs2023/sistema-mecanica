package com.garagepro.api.dto.part;

import com.garagepro.api.entity.Part;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PartResponse(
    Long id,
    String internalCode,
    String description,
    String manufacturerCode,
    Integer currentStock,
    Integer minimumStock,
    BigDecimal averageCost,
    BigDecimal salePrice,
    String unit,
    String category,
    String barcode,
    String location,
    String ncm,
    Long supplierId,
    String supplierName,
    String status,
    LocalDateTime lastMovementAt,
    LocalDateTime createdAt
) {
    public static PartResponse from(Part p) {
        return new PartResponse(
            p.getId(), p.getInternalCode(), p.getDescription(), p.getManufacturerCode(),
            p.getCurrentStock(), p.getMinimumStock(), p.getAverageCost(), p.getSalePrice(),
            p.getUnit(), p.getCategory(), p.getBarcode(), p.getLocation(), p.getNcm(),
            p.getSupplier() != null ? p.getSupplier().getId() : null,
            p.getSupplier() != null ? p.getSupplier().getCorporateName() : null,
            p.getStatus().name(),
            p.getLastMovementAt(), p.getCreatedAt()
        );
    }
}
