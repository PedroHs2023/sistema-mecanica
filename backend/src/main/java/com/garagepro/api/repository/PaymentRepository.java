package com.garagepro.api.repository;

import com.garagepro.api.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByServiceOrderId(Long serviceOrderId);
    List<Payment> findAllByCompanyId(Long companyId);
}
