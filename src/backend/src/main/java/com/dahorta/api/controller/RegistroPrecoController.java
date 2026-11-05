package com.dahorta.api.controller;

import com.dahorta.api.dto.RegistroPrecoRequestDTO;
import com.dahorta.api.dto.RegistroPrecoResponseDTO;
import com.dahorta.api.service.RegistroPrecoService;
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
@RequestMapping("/api/v1/admin/historico-precos")
@PreAuthorize("hasRole('ADMIN')")
public class RegistroPrecoController {

    private final RegistroPrecoService registroPrecoService;

    public RegistroPrecoController(RegistroPrecoService registroPrecoService) {
        this.registroPrecoService = registroPrecoService;
    }

    @GetMapping
    public List<RegistroPrecoResponseDTO> listar() {
        return registroPrecoService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RegistroPrecoResponseDTO criar(@Valid @RequestBody RegistroPrecoRequestDTO request) {
        return registroPrecoService.criar(request);
    }

    @PutMapping("/{id}")
    public RegistroPrecoResponseDTO atualizar(@PathVariable Long id,
                                               @Valid @RequestBody RegistroPrecoRequestDTO request) {
        return registroPrecoService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        registroPrecoService.excluir(id);
    }
}
