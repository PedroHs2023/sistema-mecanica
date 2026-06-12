package com.garagepro.api.service;

import com.garagepro.api.dto.supplier.SupplierRequest;
import com.garagepro.api.dto.supplier.SupplierResponse;
import com.garagepro.api.entity.Supplier;
import com.garagepro.api.entity.enums.SupplierStatus;
import com.garagepro.api.exception.ResourceNotFoundException;
import com.garagepro.api.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository repo;

    @Transactional(readOnly = true)
    public List<SupplierResponse> listAll() {
        return repo.findAllByOrderByCorporateNameAsc().stream()
            .map(SupplierResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SupplierResponse findById(Long id) {
        return SupplierResponse.from(getOrThrow(id));
    }

    @Transactional
    public SupplierResponse create(SupplierRequest req) {
        if (repo.existsByDocument(req.document())) {
            throw new IllegalArgumentException("CNPJ/CPF já cadastrado: " + req.document());
        }
        Supplier s = Supplier.builder()
            .corporateName(req.corporateName())
            .tradeName(req.tradeName())
            .document(req.document())
            .email(req.email())
            .phone(req.phone())
            .deliveryDays(req.deliveryDays())
            .status(SupplierStatus.ATIVO)
            .build();
        return SupplierResponse.from(repo.save(s));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest req) {
        Supplier s = getOrThrow(id);
        s.setCorporateName(req.corporateName());
        s.setTradeName(req.tradeName());
        s.setEmail(req.email());
        s.setPhone(req.phone());
        s.setDeliveryDays(req.deliveryDays());
        return SupplierResponse.from(repo.save(s));
    }

    @Transactional
    public void deactivate(Long id) {
        Supplier s = getOrThrow(id);
        s.setStatus(SupplierStatus.INATIVO);
        repo.save(s);
    }

    Supplier getOrThrow(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado: " + id));
    }
}
