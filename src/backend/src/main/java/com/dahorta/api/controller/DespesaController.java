package com.dahorta.api.controller;

import com.dahorta.api.dto.DespesaRequestDTO;
import com.dahorta.api.dto.DespesaResponseDTO;
import com.dahorta.api.service.DespesaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/despesas")
@PreAuthorize("hasRole('ADMIN')")
public class DespesaController {
    private final DespesaService service;
    public DespesaController(DespesaService service) { this.service = service; }
    @GetMapping
    public List<DespesaResponseDTO> listar() { return service.listar(); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DespesaResponseDTO criar(@Valid @RequestBody DespesaRequestDTO request) { return service.criar(request); }
    @PutMapping("/{id}")
    public DespesaResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody DespesaRequestDTO request) {
        return service.atualizar(id, request);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) { service.excluir(id); }
}
