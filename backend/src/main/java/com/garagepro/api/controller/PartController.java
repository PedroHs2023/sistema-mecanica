package com.garagepro.api.controller;

import com.garagepro.api.dto.part.PartRequest;
import com.garagepro.api.dto.part.PartResponse;
import com.garagepro.api.dto.stockmovement.StockMovementResponse;
import com.garagepro.api.service.PartService;
import com.garagepro.api.service.StockMovementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartService service;
    private final StockMovementService movService;

    @GetMapping
    public List<PartResponse> search(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String category
    ) {
        return service.search(q, status, category);
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return service.listCategories();
    }

    @GetMapping("/{id}")
    public PartResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/movements")
    public List<StockMovementResponse> movements(@PathVariable Long id) {
        return movService.listByPart(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PartResponse create(@Valid @RequestBody PartRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public PartResponse update(@PathVariable Long id, @Valid @RequestBody PartRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        service.deactivate(id);
    }
}
