package com.dahorta.api.service;

import com.dahorta.api.dto.ComboSlotDTO;
import com.dahorta.api.dto.IngredienteProdutoResponseDTO;
import com.dahorta.api.dto.ProdutoRequestDTO;
import com.dahorta.api.dto.ProdutoResponseDTO;
import com.dahorta.api.entity.IngredienteProduto;
import com.dahorta.api.entity.InsumoEstoque;
import com.dahorta.api.entity.Produto;
import com.dahorta.api.repository.InsumoEstoqueRepository;
import com.dahorta.api.repository.ProdutoRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final InsumoEstoqueRepository insumoRepository;
    private final ObjectMapper objectMapper;

    public ProdutoService(ProdutoRepository produtoRepository, InsumoEstoqueRepository insumoRepository,
                          ObjectMapper objectMapper) {
        this.produtoRepository = produtoRepository;
        this.insumoRepository = insumoRepository;
        this.objectMapper = objectMapper;
    }

    private int tempoPreparo(ProdutoRequestDTO request) {
        return request.tempoPreparo() == null ? 15 : request.tempoPreparo();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarPublico(String categoria, String busca) {
        return produtoRepository.findAllByDisponivelTrueOrderByNomeAsc().stream()
                .filter(produto -> categoria == null || categoria.isBlank()
                        || produto.getCategoria() != null
                        && produto.getCategoria().equalsIgnoreCase(categoria.trim()))
                .filter(produto -> busca == null || busca.isBlank()
                        || produto.getNome().toLowerCase(Locale.ROOT).contains(busca.trim().toLowerCase(Locale.ROOT))
                        || produto.getDescricao() != null
                        && produto.getDescricao().toLowerCase(Locale.ROOT).contains(busca.trim().toLowerCase(Locale.ROOT)))
                .map(produto -> paraResposta(produto, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarPublico(Long id) {
        Produto produto = produtoRepository.findById(id)
                .filter(Produto::isDisponivel)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
        return paraResposta(produto, false);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarAdmin() {
        return produtoRepository.findAllByOrderByNomeAsc().stream()
                .map(produto -> paraResposta(produto, true)).toList();
    }

    @Transactional
    public ProdutoResponseDTO criar(ProdutoRequestDTO request) {
        Produto produto = new Produto(request.nome().trim(), request.descricao(), request.imagem(),
                request.categoria(), request.preco(), request.disponivel(), carregarIngredientes(request),
                serializarComboSlots(request.comboSlots()), tempoPreparo(request),
                serializarAlergicos(request.alergicos()));
        return paraResposta(produtoRepository.save(produto), true);
    }

    @Transactional
    public ProdutoResponseDTO atualizar(Long id, ProdutoRequestDTO request) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
        produto.atualizar(request.nome().trim(), request.descricao(), request.imagem(), request.categoria(),
                request.preco(), request.disponivel(), carregarIngredientes(request),
                serializarComboSlots(request.comboSlots()), tempoPreparo(request),
                serializarAlergicos(request.alergicos()));
        return paraResposta(produto, true);
    }

    @Transactional
    public void desativar(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
        produto.definirDisponivel(false);
    }

    @Transactional
    public ProdutoResponseDTO atualizarDisponibilidade(Long id, boolean disponivel) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
        produto.definirDisponivel(disponivel);
        return paraResposta(produto, true);
    }

    private List<IngredienteProduto> carregarIngredientes(ProdutoRequestDTO request) {
        if (request.ingredientes() == null) {
            return List.of();
        }
        return request.ingredientes().stream().map(item -> {
            InsumoEstoque insumo = insumoRepository.findById(item.insumoId())
                    .filter(InsumoEstoque::isAtivo)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Insumo não encontrado ou inativo: " + item.insumoId()));
            return new IngredienteProduto(insumo, item.quantidade());
        }).toList();
    }

    private ProdutoResponseDTO paraResposta(Produto produto, boolean incluirIngredientes) {
        List<IngredienteProdutoResponseDTO> ingredientes = incluirIngredientes
                ? produto.getIngredientes().stream()
                    .map(item -> new IngredienteProdutoResponseDTO(
                            item.getInsumo().getId(),
                            item.getInsumo().getNome(),
                            item.getInsumo().getUnidade(),
                            item.getQuantidade()))
                    .toList()
                : List.of();
        return new ProdutoResponseDTO(produto.getId(), produto.getNome(), produto.getDescricao(),
                produto.getImagem(), produto.getCategoria(), produto.getPreco(),
                produto.isDisponivel(), ingredientes, desserializarComboSlots(produto.getComboSlotsJson()),
                produto.getTempoPreparo() > 0 ? produto.getTempoPreparo() : 15,
                desserializarAlergicos(produto.getAlergicosJson()));
    }

    private String serializarAlergicos(List<String> alergicos) {
        if (alergicos == null || alergicos.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(alergicos);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Não foi possível serializar os alergênicos do produto.", exception);
        }
    }

    private List<String> desserializarAlergicos(String alergicosJson) {
        if (alergicosJson == null || alergicosJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(alergicosJson, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Não foi possível ler os alergênicos salvos do produto.", exception);
        }
    }

    private String serializarComboSlots(List<ComboSlotDTO> comboSlots) {
        if (comboSlots == null || comboSlots.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(comboSlots);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Não foi possível serializar os slots do combo.", exception);
        }
    }

    private List<ComboSlotDTO> desserializarComboSlots(String comboSlotsJson) {
        if (comboSlotsJson == null || comboSlotsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(comboSlotsJson, new TypeReference<List<ComboSlotDTO>>() {});
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Não foi possível ler os slots do combo salvo.", exception);
        }
    }
}
