package com.garagepro.api.service;

import com.garagepro.api.dto.payment.PaymentRequest;
import com.garagepro.api.dto.payment.PaymentResponse;
import com.garagepro.api.entity.Payment;
import com.garagepro.api.entity.enums.PaymentStatus;
import com.garagepro.api.repository.CompanyRepository;
import com.garagepro.api.repository.PaymentRepository;
import com.garagepro.api.repository.ServiceOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public PaymentResponse register(PaymentRequest request, Long companyId) {
        var serviceOrder = serviceOrderRepository.findById(request.serviceOrderId())
                .orElseThrow(() -> new RuntimeException("Ordem de Serviço não encontrada"));

        var company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        var payment = paymentRepository.save(Payment.builder()
                .serviceOrder(serviceOrder)
                .company(company)
                .paymentMethod(request.paymentMethod())
                .amount(request.amount())
                .paidAt(LocalDateTime.now())
                .notes(request.notes())
                .build());

        BigDecimal totalPaid = paymentRepository.findAllByServiceOrderId(serviceOrder.getId())
                .stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = serviceOrder.getTotal().subtract(totalPaid);

        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            serviceOrder.setPaymentStatus(PaymentStatus.PAGO);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            serviceOrder.setPaymentStatus(PaymentStatus.PARCIAL);
        }
        serviceOrderRepository.save(serviceOrder);

        return toResponse(payment, totalPaid, remaining);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listByServiceOrder(Long serviceOrderId) {
        var serviceOrder = serviceOrderRepository.findById(serviceOrderId)
                .orElseThrow(() -> new RuntimeException("Ordem de Serviço não encontrada"));

        BigDecimal totalPaid = paymentRepository.findAllByServiceOrderId(serviceOrderId)
                .stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = serviceOrder.getTotal().subtract(totalPaid);

        return paymentRepository.findAllByServiceOrderId(serviceOrderId)
                .stream()
                .map(p -> toResponse(p, totalPaid, remaining))
                .toList();
    }

    private PaymentResponse toResponse(Payment payment, BigDecimal totalPaid, BigDecimal remaining) {
        var so = payment.getServiceOrder();
        return new PaymentResponse(
                payment.getId(),
                so.getId(),
                so.getNumber(),
                payment.getPaymentMethod(),
                payment.getAmount(),
                so.getTotal(),
                totalPaid,
                remaining.max(BigDecimal.ZERO),
                so.getPaymentStatus(),
                payment.getPaidAt(),
                payment.getNotes()
        );
    }
}
