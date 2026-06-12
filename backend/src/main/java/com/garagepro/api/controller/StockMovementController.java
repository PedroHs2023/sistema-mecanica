package com.garagepro.api.controller;

import com.garagepro.api.dto.stockmovement.StockMovementRequest;
import com.garagepro.api.dto.stockmovement.StockMovementResponse;
import com.garagepro.api.service.StockMovementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService service;

    @GetMapping
    public List<StockMovementResponse> listRecent(
        @RequestParam(defaultValue = "50") int limit
    ) {
        return service.listRecent(limit);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovementResponse create(@Valid @RequestBody StockMovementRequest req) {
        return service.create(req);
    }
}
