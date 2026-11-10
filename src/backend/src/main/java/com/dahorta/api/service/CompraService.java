package com.dahorta.api.service;

import com.dahorta.api.dto.CompraRequestDTO;
import com.dahorta.api.dto.CompraResponseDTO;
import com.dahorta.api.entity.Compra;
import com.dahorta.api.entity.ItemCompra;
import com.dahorta.api.entity.MovimentacaoEstoque;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.RegistroPreco;
import com.dahorta.api.entity.TipoMovimentacaoEstoque;
import com.dahorta.api.repository.CompraRepository;
import com.dahorta.api.repository.FornecedorRepository;
import com.dahorta.api.repository.InsumoEstoqueRepository;
import com.dahorta.api.repository.MovimentacaoEstoqueRepository;
import com.dahorta.api.repository.RegistroPrecoRepository;
import com.dahorta.api.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class CompraService {
    private final CompraRepository compras;
    private final FornecedorRepository fornecedores;
    private final InsumoEstoqueRepository insumos;
    private final UsuarioRepository usuarios;
    private final MovimentacaoEstoqueRepository movimentos;
    private final RegistroPrecoRepository precos;

    public CompraService(CompraRepository compras, FornecedorRepository fornecedores,
                         InsumoEstoqueRepository insumos, UsuarioRepository usuarios,
                         MovimentacaoEstoqueRepository movimentos, RegistroPrecoRepository precos) {
        this.compras = compras;
        this.fornecedores = fornecedores;
        this.insumos = insumos;
        this.usuarios = usuarios;
        this.movimentos = movimentos;
        this.precos = precos;
    }

    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listar() {
        return compras.findAllByOrderByCriadaEmDesc().stream().map(this::response).toList();
    }

    @Transactional
    public CompraResponseDTO receber(CompraRequestDTO request, Authentication authentication) {
        var usuario = usuarios.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário inválido."));
        if (usuario.getPerfil() != PerfilUsuario.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente ADMIN pode registrar compras.");
        }
        var fornecedor = fornecedores.findById(request.fornecedorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor não encontrado."));
        Compra compra = new Compra(fornecedor, usuario, normalizar(request.observacao()));
        for (var linha : request.itens()) {
            var insumo = insumos.findForUpdateById(linha.insumoId())
                    .filter(item -> item.isAtivo())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Insumo ativo não encontrado."));
            var item = new ItemCompra(insumo, linha.quantidade(), linha.precoUnitario());
            compra.adicionarItem(item);
        }
        compra.receber(Instant.now());
        compra = compras.save(compra);
        for (ItemCompra item : compra.getItens()) {
            var insumo = item.getInsumo();
            insumo.definirQuantidade(insumo.getQuantidadeAtual().add(item.getQuantidade()));
            movimentos.save(new MovimentacaoEstoque(insumo, usuario, null, TipoMovimentacaoEstoque.ENTRADA,
                    item.getQuantidade(), "Recebimento da compra " + compra.getId()));
            precos.save(new RegistroPreco(insumo, fornecedor, item.getPrecoUnitario(),
                    compra.getRecebidaEm(), "Compra " + compra.getId()));
        }
        return response(compra);
    }

    private String normalizar(String texto) { return texto == null || texto.isBlank() ? null : texto.trim(); }

    private CompraResponseDTO response(Compra compra) {
        return new CompraResponseDTO(compra.getId(), compra.getFornecedor().getId(),
                compra.getFornecedor().getNome(), compra.getUsuario().getId(), compra.getUsuario().getNome(),
                compra.getCriadaEm(), compra.getRecebidaEm(), compra.getObservacao(), compra.getTotal(),
                compra.getItens().stream().map(item -> new CompraResponseDTO.Item(
                        item.getInsumo().getId(), item.getInsumo().getNome(), item.getInsumo().getUnidade(),
                        item.getQuantidade(), item.getPrecoUnitario(), item.getSubtotal())).toList());
    }
}
