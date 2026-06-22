package com.garagepro.api.repository;

import com.garagepro.api.entity.NfeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NfeItemRepository extends JpaRepository<NfeItem, Long> {
}
