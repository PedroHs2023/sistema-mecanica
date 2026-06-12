package com.garagepro.api.dto.part;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record PartRequest(
    @NotBlank @Size(max = 50)  String internalCode,
    @NotBlank @Size(max = 300) String description,
    @Size(max = 100)           String manufacturerCode,
    @Min(0)                    Integer minimumStock,
    @NotNull @DecimalMin("0")  BigDecimal averageCost,
    @NotNull @DecimalMin("0")  BigDecimal salePrice,
    @NotBlank @Size(max = 20)  String unit,
    @Size(max = 100)           String category,
    @Size(max = 50)            String barcode,
    @Size(max = 100)           String location,
    @Size(max = 20)            String ncm,
    Long supplierId
) {}
