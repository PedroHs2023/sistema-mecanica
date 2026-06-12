package com.garagepro.api.service;

import com.garagepro.api.dto.imports.*;
import com.garagepro.api.entity.ImportHistory;
import com.garagepro.api.entity.Part;
import com.garagepro.api.entity.Supplier;
import com.garagepro.api.entity.enums.ImportStatus;
import com.garagepro.api.entity.enums.ImportType;
import com.garagepro.api.entity.enums.SupplierStatus;
import com.garagepro.api.parser.NfeXmlParser;
import com.garagepro.api.parser.SpreadsheetParser;
import com.garagepro.api.repository.ImportHistoryRepository;
import com.garagepro.api.repository.PartRepository;
import com.garagepro.api.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class ImportService {

    private final NfeXmlParser nfeParser;
    private final SpreadsheetParser spreadsheetParser;
    private final PartRepository partRepo;
    private final SupplierRepository supplierRepo;
    private final StockMovementService movementService;
    private final ImportHistoryRepository historyRepo;

    // ─── NF-e XML ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public NfeImportPreviewResponse previewXml(MultipartFile file) throws Exception {
        NfeImportPreviewResponse preview = nfeParser.parse(file.getInputStream());

        // Enrich items: check existing parts
        List<NfeItemPreview> enriched = preview.items().stream().map(item -> {
            Optional<Part> byManuf = partRepo.findByManufacturerCode(item.supplierCode());
            if (byManuf.isPresent()) {
                Part match = byManuf.get();
                return new NfeItemPreview(
                    item.supplierCode(), item.description(), item.ncm(), item.cfop(),
                    item.unit(), item.quantity(), item.unitCost(), item.totalCost(),
                    item.suggestedSalePrice(), item.marginPercent(),
                    "POSSIVEL_DUPLICIDADE", match.getId(), match.getDescription()
                );
            }
            Optional<Part> byDesc = partRepo.findAll().stream()
                .filter(p -> similarity(p.getDescription(), item.description()) > 0.75)
                .findFirst();
            if (byDesc.isPresent()) {
                Part match = byDesc.get();
                return new NfeItemPreview(
                    item.supplierCode(), item.description(), item.ncm(), item.cfop(),
                    item.unit(), item.quantity(), item.unitCost(), item.totalCost(),
                    item.suggestedSalePrice(), item.marginPercent(),
                    "JA_CADASTRADA", match.getId(), match.getDescription()
                );
            }
            return item;
        }).toList();

        return new NfeImportPreviewResponse(
            preview.invoiceNumber(), preview.series(), preview.accessKey(),
            preview.supplierName(), preview.supplierDocument(), preview.issueDate(),
            preview.totalValue(), enriched
        );
    }

    @Transactional
    public ImportResult confirmXml(NfeConfirmRequest req) {
        AtomicInteger created = new AtomicInteger();
        AtomicInteger updated = new AtomicInteger();
        AtomicInteger ignored = new AtomicInteger();

        // Ensure supplier exists
        Supplier supplier = supplierRepo.findByDocument(normalizeDoc(req.supplierDocument()))
            .orElseGet(() -> supplierRepo.save(Supplier.builder()
                .corporateName(req.supplierName())
                .document(normalizeDoc(req.supplierDocument()))
                .status(SupplierStatus.ATIVO)
                .build()));

        for (NfeConfirmItem item : req.items()) {
            switch (item.action().toLowerCase()) {
                case "ignore" -> ignored.incrementAndGet();
                case "create" -> {
                    String code = generateCode(item.supplierCode(), item.description());
                    Part part = Part.builder()
                        .internalCode(code)
                        .description(item.description())
                        .manufacturerCode(item.supplierCode())
                        .ncm(item.ncm())
                        .unit(item.unit() != null ? item.unit() : "UN")
                        .currentStock(0)
                        .minimumStock(0)
                        .averageCost(item.unitCost())
                        .salePrice(item.suggestedSalePrice())
                        .supplier(supplier)
                        .build();
                    part.recalculateStatus();
                    part = partRepo.save(part);
                    movementService.applyEntryFromImport(part, item.quantity(), item.unitCost(),
                        req.supplierName(), "Sistema");
                    created.incrementAndGet();
                }
                case "update", "link" -> {
                    Long partId = item.existingPartId();
                    if (partId == null) { ignored.incrementAndGet(); continue; }
                    Part part = partRepo.findById(partId).orElse(null);
                    if (part == null) { ignored.incrementAndGet(); continue; }
                    movementService.applyEntryFromImport(part, item.quantity(), item.unitCost(),
                        req.supplierName(), "Sistema");
                    updated.incrementAndGet();
                }
                default -> ignored.incrementAndGet();
            }
        }

        int total = req.items().size();
        ImportStatus status = ignored.get() > 0 ? ImportStatus.COM_PENDENCIAS : ImportStatus.PROCESSADA;

        historyRepo.save(ImportHistory.builder()
            .type(ImportType.XML_NFE)
            .fileName(req.fileName())
            .itemsFound(total)
            .createdCount(created.get())
            .updatedCount(updated.get())
            .ignoredCount(ignored.get())
            .status(status)
            .build());

        return new ImportResult(total, created.get(), updated.get(), ignored.get(),
            status.name(), "Importação concluída com sucesso.");
    }

    // ─── Spreadsheet ─────────────────────────────────────────────────────────────

    public SpreadsheetImportPreviewResponse previewSpreadsheet(MultipartFile file) throws Exception {
        String name = Objects.requireNonNull(file.getOriginalFilename(), "").toLowerCase();
        if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
            return spreadsheetParser.parseXlsx(file.getInputStream(), file.getOriginalFilename());
        } else {
            return spreadsheetParser.parseCsv(file.getInputStream(), file.getOriginalFilename());
        }
    }

    @Transactional
    public ImportResult confirmSpreadsheet(MultipartFile file) throws Exception {
        SpreadsheetImportPreviewResponse preview = previewSpreadsheet(file);

        AtomicInteger created = new AtomicInteger();
        AtomicInteger ignored = new AtomicInteger();

        for (SpreadsheetItemPreview item : preview.items()) {
            if (!"PRONTO_PARA_IMPORTAR".equals(item.status())) {
                ignored.incrementAndGet();
                continue;
            }
            String code = item.internalCode() != null
                ? item.internalCode()
                : generateCode(item.manufacturerCode(), item.description());

            if (partRepo.existsByInternalCode(code)) {
                ignored.incrementAndGet();
                continue;
            }

            Part part = Part.builder()
                .internalCode(code)
                .description(item.description())
                .manufacturerCode(item.manufacturerCode())
                .currentStock(item.currentStock() != null ? item.currentStock() : 0)
                .minimumStock(0)
                .averageCost(item.averageCost() != null ? item.averageCost() : BigDecimal.ZERO)
                .salePrice(item.salePrice()    != null ? item.salePrice()    : BigDecimal.ZERO)
                .unit("UN")
                .ncm(item.ncm())
                .build();
            part.recalculateStatus();
            partRepo.save(part);
            created.incrementAndGet();
        }

        int total = preview.items().size();
        historyRepo.save(ImportHistory.builder()
            .type(ImportType.PLANILHA)
            .fileName(preview.fileName())
            .itemsFound(total)
            .createdCount(created.get())
            .updatedCount(0)
            .ignoredCount(ignored.get())
            .status(ImportStatus.PROCESSADA)
            .build());

        return new ImportResult(total, created.get(), 0, ignored.get(),
            "PROCESSADA", "Importação concluída.");
    }

    @Transactional(readOnly = true)
    public List<ImportHistoryResponse> listHistory() {
        return historyRepo.findAllByOrderByImportedAtDesc().stream()
            .map(ImportHistoryResponse::from).toList();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private String normalizeDoc(String doc) {
        return doc == null ? null : doc.replaceAll("[^0-9]", "");
    }

    private String generateCode(String manufacturerCode, String description) {
        String base = manufacturerCode != null && !manufacturerCode.isBlank()
            ? manufacturerCode.replaceAll("[^A-Za-z0-9-]", "").toUpperCase()
            : description.substring(0, Math.min(8, description.length()))
                .replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        String candidate = base;
        int suffix = 1;
        while (partRepo.existsByInternalCode(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    /** Simple character-based similarity (0..1) */
    private double similarity(String a, String b) {
        if (a == null || b == null) return 0;
        a = a.toLowerCase(); b = b.toLowerCase();
        int common = 0;
        for (int i = 0; i < Math.min(a.length(), b.length()); i++) {
            if (a.charAt(i) == b.charAt(i)) common++;
        }
        return (double) common / Math.max(a.length(), b.length());
    }
}
