package com.dahorta.api.service;

import com.dahorta.api.dto.RegistroPrecoRequestDTO;
import com.dahorta.api.dto.RegistroPrecoResponseDTO;
import com.dahorta.api.entity.Fornecedor;
import com.dahorta.api.entity.InsumoEstoque;
import com.dahorta.api.entity.RegistroPreco;
import com.dahorta.api.repository.FornecedorRepository;
import com.dahorta.api.repository.InsumoEstoqueRepository;
import com.dahorta.api.repository.RegistroPrecoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RegistroPrecoService {

    private final RegistroPrecoRepository registroRepository;
    private final InsumoEstoqueRepository insumoRepository;
    private final FornecedorRepository fornecedorRepository;

    public RegistroPrecoService(RegistroPrecoRepository registroRepository,
                                InsumoEstoqueRepository insumoRepository,
                                FornecedorRepository fornecedorRepository) {
        this.registroRepository = registroRepository;
        this.insumoRepository = insumoRepository;
        this.fornecedorRepository = fornecedorRepository;
    }

    @Transactional(readOnly = true)
    public List<RegistroPrecoResponseDTO> listar() {
        return registroRepository.findAllByOrderByDataDesc().stream().map(this::paraResposta).toList();
    }

    @Transactional
    public RegistroPrecoResponseDTO criar(RegistroPrecoRequestDTO request) {
        return paraResposta(registroRepository.save(new RegistroPreco(
                buscarInsumo(request.insumoId()),
                buscarFornecedor(request.fornecedorId()),
                request.valor(),
                request.data(),
                normalizarObservacao(request.observacao()))));
    }

    @Transactional
    public RegistroPrecoResponseDTO atualizar(Long id, RegistroPrecoRequestDTO request) {
        RegistroPreco registro = registroRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro de preço não encontrado."));
        registro.atualizar(buscarInsumo(request.insumoId()), buscarFornecedor(request.fornecedorId()),
                request.valor(), request.data(), normalizarObservacao(request.observacao()));
        return paraResposta(registro);
    }

    @Transactional
    public void excluir(Long id) {
        if (!registroRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro de preço não encontrado.");
        }
        registroRepository.deleteById(id);
    }

    private InsumoEstoque buscarInsumo(Long id) {
        return insumoRepository.findById(id)
                .filter(InsumoEstoque::isAtivo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo não encontrado."));
    }

    private Fornecedor buscarFornecedor(Long id) {
        return fornecedorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));
    }

    private String normalizarObservacao(String observacao) {
        return observacao == null || observacao.isBlank() ? null : observacao.trim();
    }

    private RegistroPrecoResponseDTO paraResposta(RegistroPreco registro) {
        return new RegistroPrecoResponseDTO(registro.getId(), registro.getInsumo().getId(),
                String.valueOf(registro.getFornecedor().getId()), registro.getValor(),
                registro.getData(), registro.getObservacao());
    }
}
