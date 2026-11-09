package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_pedido")
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(name = "nome_produto_snapshot", nullable = false, length = 150)
    private String nomeProdutoSnapshot;

    @Column(name = "preco_unitario_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitarioSnapshot;

    @Column(nullable = false)
    private int quantidade;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    protected ItemPedido() {
    }

    public ItemPedido(Produto produto, int quantidade) {
        this.produto = produto;
        this.nomeProdutoSnapshot = produto.getNome();
        this.precoUnitarioSnapshot = produto.getPreco();
        this.quantidade = quantidade;
        this.subtotal = produto.getPreco().multiply(BigDecimal.valueOf(quantidade));
    }

    void associarPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public String getNomeProdutoSnapshot() {
        return nomeProdutoSnapshot;
    }

    public Produto getProduto() {
        return produto;
    }

    public BigDecimal getPrecoUnitarioSnapshot() {
        return precoUnitarioSnapshot;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }
}
