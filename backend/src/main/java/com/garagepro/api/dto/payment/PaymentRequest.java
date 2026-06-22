package com.garagepro.api.dto.payment;

import com.garagepro.api.entity.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PaymentRequest(
    @NotNull(message = "Ordem de Serviço é obrigatória") Long serviceOrderId,
    @NotNull(message = "Forma de pagamento é obrigatória") PaymentMethod paymentMethod,
    @NotNull @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero") BigDecimal amount,
    String notes
) {}