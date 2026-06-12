package com.garagepro.api.dto.supplier;

import com.garagepro.api.entity.Supplier;

import java.time.LocalDateTime;

public record SupplierResponse(
    Long id,
    String corporateName,
    String tradeName,
    String document,
    String email,
    String phone,
    Integer deliveryDays,
    String status,
    LocalDateTime createdAt
) {
    public static SupplierResponse from(Supplier s) {
        return new SupplierResponse(
            s.getId(), s.getCorporateName(), s.getTradeName(),
            s.getDocument(), s.getEmail(), s.getPhone(),
            s.getDeliveryDays(), s.getStatus().name(), s.getCreatedAt()
        );
    }
}
