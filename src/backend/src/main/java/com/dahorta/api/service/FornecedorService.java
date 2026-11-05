package com.dahorta.api.service;

import com.dahorta.api.dto.FornecedorRequestDTO;
import com.dahorta.api.dto.FornecedorResponseDTO;
import com.dahorta.api.entity.Fornecedor;
import com.dahorta.api.repository.FornecedorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> listar() {
        return fornecedorRepository.findAllByAtivoTrueOrderByNomeAsc()
                .stream().map(this::paraResposta).toList();
    }

    @Transactional
    public FornecedorResponseDTO criar(FornecedorRequestDTO request) {
        String email = normalizarEmail(request.email());
        if (fornecedorRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail de fornecedor já cadastrado.");
        }
        return paraResposta(fornecedorRepository.save(new Fornecedor(
                request.nome().trim(), normalizarCnpj(request.cnpj()), request.telefone().trim(),
                email, request.endereco().trim())));
    }

    @Transactional
    public FornecedorResponseDTO atualizar(Long id, FornecedorRequestDTO request) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));
        String email = normalizarEmail(request.email());
        fornecedorRepository.findByEmailIgnoreCase(email)
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail de fornecedor já cadastrado.");
                });
        fornecedor.atualizar(request.nome().trim(), normalizarCnpj(request.cnpj()),
                request.telefone().trim(), email, request.endereco().trim());
        return paraResposta(fornecedor);
    }

    @Transactional
    public void desativar(Long id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));
        fornecedor.desativar();
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizarCnpj(String cnpj) {
        return cnpj == null || cnpj.isBlank() ? null : cnpj.trim();
    }

    private FornecedorResponseDTO paraResposta(Fornecedor fornecedor) {
        return new FornecedorResponseDTO(fornecedor.getId(), fornecedor.getNome(), fornecedor.getCnpj(),
                fornecedor.getTelefone(), fornecedor.getEmail(), fornecedor.getEndereco());
    }
}
