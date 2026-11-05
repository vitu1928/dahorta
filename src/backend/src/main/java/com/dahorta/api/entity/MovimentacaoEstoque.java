package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "movimentacoes_estoque")
public class MovimentacaoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "insumo_id", nullable = false)
    private InsumoEstoque insumo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMovimentacaoEstoque tipo;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantidade;

    @Column(length = 300)
    private String observacao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected MovimentacaoEstoque() {
    }

    public MovimentacaoEstoque(InsumoEstoque insumo, Usuario usuario, Pedido pedido,
                               TipoMovimentacaoEstoque tipo, BigDecimal quantidade, String observacao) {
        this.insumo = insumo;
        this.usuario = usuario;
        this.pedido = pedido;
        this.tipo = tipo;
        this.quantidade = quantidade;
        this.observacao = observacao;
        this.criadoEm = Instant.now();
    }

    public Long getId() { return id; }
    public InsumoEstoque getInsumo() { return insumo; }
    public Usuario getUsuario() { return usuario; }
    public Pedido getPedido() { return pedido; }
    public TipoMovimentacaoEstoque getTipo() { return tipo; }
    public BigDecimal getQuantidade() { return quantidade; }
    public String getObservacao() { return observacao; }
    public Instant getCriadoEm() { return criadoEm; }
}
