package com.garagepro.api.repository;

import com.garagepro.api.entity.StockMovement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByPartIdOrderByCreatedAtDesc(Long partId);
    List<StockMovement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
