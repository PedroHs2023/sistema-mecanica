package com.garagepro.api.controller;

import com.garagepro.api.dto.payment.PaymentRequest;
import com.garagepro.api.dto.payment.PaymentResponse;
import com.garagepro.api.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse register(@Valid @RequestBody PaymentRequest request) {
        return paymentService.register(request, 1L);
    }

    @GetMapping("/service-order/{serviceOrderId}")
    public List<PaymentResponse> listByServiceOrder(@PathVariable Long serviceOrderId) {
        return paymentService.listByServiceOrder(serviceOrderId);
    }
}
