package com.garagepro.api.dto.stockmovement;

import com.garagepro.api.entity.StockMovement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record StockMovementResponse(
    Long id,
    Long partId,
    String partDescription,
    String partInternalCode,
    String type,
    Integer quantity,
    BigDecimal unitCost,
    String relatedServiceOrderNumber,
    String supplierName,
    String userName,
    String reason,
    LocalDateTime createdAt
) {
    public static StockMovementResponse from(StockMovement m) {
        return new StockMovementResponse(
            m.getId(),
            m.getPart().getId(),
            m.getPart().getDescription(),
            m.getPart().getInternalCode(),
            m.getType().name(),
            m.getQuantity(),
            m.getUnitCost(),
            m.getRelatedServiceOrderNumber(),
            m.getSupplierName(),
            m.getUserName(),
            m.getReason(),
            m.getCreatedAt()
        );
    }
}
