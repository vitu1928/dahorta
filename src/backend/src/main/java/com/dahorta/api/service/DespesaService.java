package com.dahorta.api.service;

import com.dahorta.api.dto.DespesaRequestDTO;
import com.dahorta.api.dto.DespesaResponseDTO;
import com.dahorta.api.entity.Despesa;
import com.dahorta.api.repository.DespesaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DespesaService {
    private final DespesaRepository repository;
    public DespesaService(DespesaRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<DespesaResponseDTO> listar() {
        return repository.findAllByOrderByDataDesc().stream().map(this::response).toList();
    }

    @Transactional
    public DespesaResponseDTO criar(DespesaRequestDTO request) {
        return response(repository.save(new Despesa(request.categoria().trim(), request.descricao().trim(),
                request.valor(), request.data(), request.recorrente(), validarStatus(request.status()))));
    }

    @Transactional
    public DespesaResponseDTO atualizar(Long id, DespesaRequestDTO request) {
        Despesa despesa = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Despesa não encontrada."));
        despesa.atualizar(request.categoria().trim(), request.descricao().trim(), request.valor(),
                request.data(), request.recorrente(), validarStatus(request.status()));
        return response(despesa);
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Despesa não encontrada.");
        }
        repository.deleteById(id);
    }

    private String validarStatus(String status) {
        String normalized = status.trim().toUpperCase();
        if (!List.of("PENDENTE", "PAGO", "CANCELADO").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status de despesa inválido.");
        }
        return normalized;
    }
    private DespesaResponseDTO response(Despesa d) {
        return new DespesaResponseDTO(d.getId(), d.getCategoria(), d.getDescricao(), d.getValor(),
                d.getData(), d.isRecorrente(), d.getStatus(), d.getCriadoEm());
    }
}
