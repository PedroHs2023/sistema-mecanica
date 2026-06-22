package com.garagepro.api.controller;

import com.garagepro.api.dto.nfe.NfeRequest;
import com.garagepro.api.dto.nfe.NfeResponse;
import com.garagepro.api.service.NfeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nfe")
@RequiredArgsConstructor
public class NfeController {

    private final NfeService nfeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NfeResponse create(@Valid @RequestBody NfeRequest request) {
        return nfeService.create(request, 1L);
    }

    @GetMapping
    public List<NfeResponse> listAll() {
        return nfeService.listAll(1L);
    }

    @GetMapping("/{id}")
    public NfeResponse findById(@PathVariable Long id) {
        return nfeService.findById(id);
    }

    @PostMapping("/{id}/enviar")
    public NfeResponse enviar(@PathVariable Long id) {
        return nfeService.enviar(id);
    }
}
