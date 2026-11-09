package com.dahorta.api.pattern.creational;

import com.dahorta.api.entity.EnderecoEntrega;
import com.dahorta.api.entity.ItemPedido;
import com.dahorta.api.entity.MetodoPagamento;
import com.dahorta.api.entity.Pedido;
import com.dahorta.api.entity.Produto;
import com.dahorta.api.entity.Usuario;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Padrão GoF: Builder */
public final class PedidoBuilder {
    private final Usuario cliente;
    private final MetodoPagamento metodoPagamento;
    private final EnderecoEntrega enderecoEntrega;
    private final BigDecimal taxaEntrega;
    private final Instant criadoEm;
    private final String codigoEntregaHash;
    private final List<ItemPedido> itens = new ArrayList<>();
    private String observacoes;

    private PedidoBuilder(Usuario cliente, MetodoPagamento metodoPagamento,
                          EnderecoEntrega enderecoEntrega, BigDecimal taxaEntrega,
                          String codigoEntregaHash, Instant criadoEm) {
        this.cliente = Objects.requireNonNull(cliente, "Cliente é obrigatório.");
        this.metodoPagamento = Objects.requireNonNull(metodoPagamento, "Método de pagamento é obrigatório.");
        this.enderecoEntrega = Objects.requireNonNull(enderecoEntrega, "Endereço é obrigatório.");
        this.taxaEntrega = Objects.requireNonNull(taxaEntrega, "Taxa de entrega é obrigatória.");
        if (taxaEntrega.signum() < 0) {
            throw new IllegalArgumentException("Taxa de entrega não pode ser negativa.");
        }
        this.codigoEntregaHash = Objects.requireNonNull(codigoEntregaHash, "Hash de entrega é obrigatório.");
        this.criadoEm = Objects.requireNonNull(criadoEm, "Data de criação é obrigatória.");
    }

    public static PedidoBuilder umPedido(Usuario cliente, MetodoPagamento metodoPagamento,
                                         EnderecoEntrega enderecoEntrega, BigDecimal taxaEntrega,
                                         String codigoEntregaHash, Instant criadoEm) {
        return new PedidoBuilder(cliente, metodoPagamento, enderecoEntrega, taxaEntrega,
                codigoEntregaHash, criadoEm);
    }

    public PedidoBuilder observacoes(String observacoes) {
        this.observacoes = observacoes;
        return this;
    }

    public PedidoBuilder adicionarItem(Produto produto, int quantidade) {
        Objects.requireNonNull(produto, "Produto é obrigatório.");
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade do item deve ser maior que zero.");
        }
        if (!produto.isDisponivel()) {
            throw new IllegalArgumentException("Produto indisponível: " + produto.getNome());
        }
        itens.add(new ItemPedido(produto, quantidade));
        return this;
    }

    public Pedido construir() {
        if (itens.isEmpty()) {
            throw new IllegalStateException("Pedido deve conter ao menos um item.");
        }
        Pedido pedido = new Pedido(cliente, metodoPagamento, enderecoEntrega, BigDecimal.ZERO,
                taxaEntrega, observacoes, codigoEntregaHash, criadoEm);
        itens.forEach(pedido::adicionarItem);
        return pedido;
    }
}
