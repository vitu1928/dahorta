package com.dahorta.api.controller;

import com.dahorta.api.dto.InsumoRequestDTO;
import com.dahorta.api.dto.InsumoResponseDTO;
import com.dahorta.api.dto.MovimentacaoEstoqueRequestDTO;
import com.dahorta.api.dto.MovimentacaoEstoqueResponseDTO;
import com.dahorta.api.service.EstoqueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/v1/estoque")
@PreAuthorize("hasAnyRole('ADMIN', 'COZINHA')")
public class EstoqueController {

    private final EstoqueService estoqueService;

    public EstoqueController(EstoqueService estoqueService) {
        this.estoqueService = estoqueService;
    }

    @GetMapping("/insumos")
    public List<InsumoResponseDTO> listar() {
        return estoqueService.listar();
    }

    @GetMapping("/insumos/abaixo-minimo")
    public List<InsumoResponseDTO> listarAbaixoDoMinimo() {
        return estoqueService.listarAbaixoDoMinimo();
    }

    @PostMapping("/insumos")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public InsumoResponseDTO criar(@Valid @RequestBody InsumoRequestDTO request) {
        return estoqueService.criar(request);
    }

    @PutMapping("/insumos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public InsumoResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody InsumoRequestDTO request,
                                       Authentication authentication) {
        return estoqueService.atualizar(id, request, authentication);
    }

    @DeleteMapping("/insumos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(@PathVariable Long id) {
        estoqueService.desativar(id);
    }

    @PostMapping("/movimentacoes")
    public InsumoResponseDTO movimentar(@Valid @RequestBody MovimentacaoEstoqueRequestDTO request,
                                        Authentication authentication) {
        return estoqueService.movimentar(request, authentication);
    }

    @GetMapping("/movimentacoes")
    public List<MovimentacaoEstoqueResponseDTO> listarMovimentacoes() {
        return estoqueService.listarMovimentacoes();
    }
}
