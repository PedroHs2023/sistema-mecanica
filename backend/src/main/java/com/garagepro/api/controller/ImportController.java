package com.garagepro.api.controller;

import com.garagepro.api.dto.imports.*;
import com.garagepro.api.service.ImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService service;

    // ─── NF-e XML ─────────────────────────────────────────────────────────────

    @PostMapping("/xml/preview")
    public NfeImportPreviewResponse previewXml(@RequestParam("file") MultipartFile file) throws Exception {
        return service.previewXml(file);
    }

    @PostMapping("/xml/confirm")
    @ResponseStatus(HttpStatus.CREATED)
    public ImportResult confirmXml(@Valid @RequestBody NfeConfirmRequest req) {
        return service.confirmXml(req);
    }

    // ─── Spreadsheet ──────────────────────────────────────────────────────────

    @PostMapping("/spreadsheet/preview")
    public SpreadsheetImportPreviewResponse previewSpreadsheet(
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        return service.previewSpreadsheet(file);
    }

    @PostMapping("/spreadsheet/confirm")
    @ResponseStatus(HttpStatus.CREATED)
    public ImportResult confirmSpreadsheet(@RequestParam("file") MultipartFile file) throws Exception {
        return service.confirmSpreadsheet(file);
    }

    // ─── History ──────────────────────────────────────────────────────────────

    @GetMapping("/history")
    public List<ImportHistoryResponse> history() {
        return service.listHistory();
    }
}
