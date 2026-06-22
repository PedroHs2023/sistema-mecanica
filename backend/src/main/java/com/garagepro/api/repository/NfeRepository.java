package com.garagepro.api.repository;

import com.garagepro.api.entity.Nfe;
import com.garagepro.api.entity.enums.NfeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NfeRepository extends JpaRepository<Nfe, Long> {
    List<Nfe> findAllByCompanyId(Long companyId);
    List<Nfe> findAllByCompanyIdAndStatus(Long companyId, NfeStatus status);
    boolean existsByNumeroAndCompanyId(Integer numero, Long companyId);
}
