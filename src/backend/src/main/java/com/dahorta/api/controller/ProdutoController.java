package com.dahorta.api.controller;

import com.dahorta.api.dto.AtualizarDisponibilidadeProdutoRequestDTO;
import com.dahorta.api.dto.ProdutoRequestDTO;
import com.dahorta.api.dto.ProdutoResponseDTO;
import com.dahorta.api.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping("/api/v1/produtos")
    public List<ProdutoResponseDTO> listarPublico(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String busca) {
        return produtoService.listarPublico(categoria, busca);
    }

    @GetMapping("/api/v1/produtos/{id}")
    public ProdutoResponseDTO buscarPublico(@PathVariable Long id) {
        return produtoService.buscarPublico(id);
    }

    @GetMapping("/api/v1/admin/produtos")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ProdutoResponseDTO> listarAdmin() {
        return produtoService.listarAdmin();
    }

    @PostMapping({"/api/v1/admin/produtos", "/api/v1/produtos"})
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoResponseDTO criar(@Valid @RequestBody ProdutoRequestDTO request) {
        return produtoService.criar(request);
    }

    @PutMapping({"/api/v1/admin/produtos/{id}", "/api/v1/produtos/{id}"})
    @PreAuthorize("hasRole('ADMIN')")
    public ProdutoResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoRequestDTO request) {
        return produtoService.atualizar(id, request);
    }

    @DeleteMapping({"/api/v1/admin/produtos/{id}", "/api/v1/produtos/{id}"})
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(@PathVariable Long id) {
        produtoService.desativar(id);
    }

    @PatchMapping({"/api/v1/admin/produtos/{id}/disponibilidade", "/api/v1/produtos/{id}/disponibilidade"})
    @PreAuthorize("hasRole('ADMIN')")
    public ProdutoResponseDTO atualizarDisponibilidade(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarDisponibilidadeProdutoRequestDTO request) {
        return produtoService.atualizarDisponibilidade(id, request.disponivel());
    }
}
