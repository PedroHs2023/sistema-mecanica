package com.garagepro.api.service;

import com.garagepro.api.dto.part.PartRequest;
import com.garagepro.api.dto.part.PartResponse;
import com.garagepro.api.entity.Part;
import com.garagepro.api.entity.enums.PartStatus;
import com.garagepro.api.exception.ResourceNotFoundException;
import com.garagepro.api.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartService {

    private final PartRepository repo;
    private final SupplierService supplierService;

    @Transactional(readOnly = true)
    public List<PartResponse> search(String q, String status, String category) {
        PartStatus statusEnum = (status != null && !status.isBlank())
            ? PartStatus.valueOf(status) : null;
        return repo.search(q, statusEnum, category).stream()
            .map(PartResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public PartResponse findById(Long id) {
        return PartResponse.from(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<String> listCategories() {
        return repo.findDistinctCategories();
    }

    @Transactional
    public PartResponse create(PartRequest req) {
        if (repo.existsByInternalCode(req.internalCode())) {
            throw new IllegalArgumentException("Código já cadastrado: " + req.internalCode());
        }
        Part p = buildFromRequest(new Part(), req);
        p.recalculateStatus();
        return PartResponse.from(repo.save(p));
    }

    @Transactional
    public PartResponse update(Long id, PartRequest req) {
        Part p = getOrThrow(id);
        buildFromRequest(p, req);
        p.recalculateStatus();
        return PartResponse.from(repo.save(p));
    }

    @Transactional
    public void deactivate(Long id) {
        Part p = getOrThrow(id);
        p.setStatus(PartStatus.INATIVO);
        repo.save(p);
    }

    Part getOrThrow(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Peça não encontrada: " + id));
    }

    private Part buildFromRequest(Part p, PartRequest req) {
        p.setInternalCode(req.internalCode());
        p.setDescription(req.description());
        p.setManufacturerCode(req.manufacturerCode());
        p.setMinimumStock(req.minimumStock() != null ? req.minimumStock() : 0);
        p.setAverageCost(req.averageCost());
        p.setSalePrice(req.salePrice());
        p.setUnit(req.unit());
        p.setCategory(req.category());
        p.setBarcode(req.barcode());
        p.setLocation(req.location());
        p.setNcm(req.ncm());
        if (req.supplierId() != null) {
            p.setSupplier(supplierService.getOrThrow(req.supplierId()));
        }
        return p;
    }
}
