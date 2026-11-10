package com.dahorta.api.controller;

import com.dahorta.api.dto.InformacaoRestauranteDTO;
import com.dahorta.api.entity.PratoDia;
import com.dahorta.api.repository.PratoDiaRepository;
import com.dahorta.api.repository.ProdutoRepository;
import com.dahorta.api.service.RestauranteDetalhesService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ConfiguracaoCatalogoController {
    private final ProdutoRepository produtos;
    private final PratoDiaRepository pratos;
    private final RestauranteDetalhesService detalhes;

    public ConfiguracaoCatalogoController(ProdutoRepository produtos, PratoDiaRepository pratos,
                                          RestauranteDetalhesService detalhes) {
        this.produtos = produtos;
        this.pratos = pratos;
        this.detalhes = detalhes;
    }

    @GetMapping("/categorias")
    public List<Map<String, String>> categorias() {
        return produtos.findAllByDisponivelTrueOrderByNomeAsc().stream()
                .map(p -> p.getCategoria())
                .filter(c -> c != null && !c.isBlank()).distinct().sorted()
                .map(c -> Map.of("id", c, "name", c, "icon", "leaf")).toList();
    }

    @GetMapping("/prato-do-dia")
    @Transactional(readOnly = true)
    public Map<Integer, String> pratosDia() {
        Map<Integer, String> config = new LinkedHashMap<>();
        pratos.findAll().forEach(p -> config.put(p.getDiaSemana(), String.valueOf(p.getProduto().getId())));
        return config;
    }

    public record PratoDiaRequest(@Positive Long produtoId) {}

    @PutMapping("/admin/prato-do-dia/{dia}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void definirPrato(@PathVariable int dia, @Valid @RequestBody PratoDiaRequest request) {
        if (dia < 1 || dia > 7) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dia deve estar entre 1 e 7.");
        var produto = produtos.findById(request.produtoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
        pratos.save(new PratoDia(dia, produto));
    }

    @GetMapping("/restaurante/detalhes")
    public InformacaoRestauranteDTO detalhes() { return detalhes.buscar(); }

    @PatchMapping("/admin/restaurante/detalhes")
    @PreAuthorize("hasRole('ADMIN')")
    public InformacaoRestauranteDTO atualizarDetalhes(@Valid @RequestBody InformacaoRestauranteDTO request) {
        return detalhes.atualizar(request);
    }
}
