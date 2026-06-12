package com.garagepro.api.dto.supplier;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SupplierRequest(
    @NotBlank @Size(max = 200) String corporateName,
    @Size(max = 200) String tradeName,
    @NotBlank @Size(max = 20) String document,
    @Size(max = 150) String email,
    @Size(max = 30) String phone,
    Integer deliveryDays
) {}
