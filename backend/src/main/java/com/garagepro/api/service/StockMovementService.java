package com.garagepro.api.service;

import com.garagepro.api.dto.stockmovement.StockMovementRequest;
import com.garagepro.api.dto.stockmovement.StockMovementResponse;
import com.garagepro.api.entity.Part;
import com.garagepro.api.entity.StockMovement;
import com.garagepro.api.entity.enums.StockMovementType;
import com.garagepro.api.repository.PartRepository;
import com.garagepro.api.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository repo;
    private final PartRepository partRepo;
    private final PartService partService;

    @Transactional(readOnly = true)
    public List<StockMovementResponse> listRecent(int limit) {
        return repo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit)).stream()
            .map(StockMovementResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> listByPart(Long partId) {
        return repo.findByPartIdOrderByCreatedAtDesc(partId).stream()
            .map(StockMovementResponse::from).toList();
    }

    @Transactional
    public StockMovementResponse create(StockMovementRequest req) {
        Part part = partService.getOrThrow(req.partId());
        StockMovementType type = StockMovementType.valueOf(req.type());

        applyMovement(part, type, req.quantity(), req.unitCost());
        part.setLastMovementAt(LocalDateTime.now());
        part.recalculateStatus();
        partRepo.save(part);

        StockMovement m = StockMovement.builder()
            .part(part)
            .type(type)
            .quantity(req.quantity())
            .unitCost(req.unitCost())
            .relatedServiceOrderNumber(req.relatedServiceOrderNumber())
            .supplierName(req.supplierName())
            .userName(req.userName())
            .reason(req.reason())
            .build();

        return StockMovementResponse.from(repo.save(m));
    }

    void applyEntryFromImport(Part part, int qty, BigDecimal unitCost, String supplierName, String userName) {
        part.applyWeightedAverageCost(qty, unitCost);
        part.setCurrentStock(part.getCurrentStock() + qty);
        part.setLastMovementAt(LocalDateTime.now());
        part.recalculateStatus();
        partRepo.save(part);

        StockMovement m = StockMovement.builder()
            .part(part)
            .type(StockMovementType.ENTRADA_COMPRA)
            .quantity(qty)
            .unitCost(unitCost)
            .supplierName(supplierName)
            .userName(userName)
            .reason("Importação de NF-e")
            .build();
        repo.save(m);
    }

    private void applyMovement(Part part, StockMovementType type, int qty, BigDecimal unitCost) {
        switch (type) {
            case ENTRADA_COMPRA:
                if (unitCost != null) part.applyWeightedAverageCost(qty, unitCost);
                part.setCurrentStock(part.getCurrentStock() + qty);
                break;
            case AJUSTE_POSITIVO:
                part.setCurrentStock(part.getCurrentStock() + qty);
                break;
            case SAIDA_OS:
            case AJUSTE_NEGATIVO:
            case DEVOLUCAO_FORNECEDOR:
                int newStock = part.getCurrentStock() - qty;
                part.setCurrentStock(Math.max(0, newStock));
                break;
            case ESTORNO_OS:
                part.setCurrentStock(part.getCurrentStock() + qty);
                break;
        }
    }
}
