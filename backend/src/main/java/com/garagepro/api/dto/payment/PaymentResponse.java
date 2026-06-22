package com.garagepro.api.dto.payment;

import com.garagepro.api.entity.enums.PaymentMethod;
import com.garagepro.api.entity.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
    Long id,
    Long serviceOrderId,
    String serviceOrderNumber,
    PaymentMethod paymentMethod,
    BigDecimal amount,
    BigDecimal serviceOrderTotal,
    BigDecimal totalPaid,
    BigDecimal remaining,
    PaymentStatus paymentStatus,
    LocalDateTime paidAt,
    String notes
) {}