package com.garagepro.api.repository;

import com.garagepro.api.entity.Purchase;
import com.garagepro.api.entity.enums.PurchaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findAllByOrderByCreatedAtDesc();
    List<Purchase> findByStatusOrderByCreatedAtDesc(PurchaseStatus status);
    long countByStatus(PurchaseStatus status);
}
