package com.dahorta.api.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import com.dahorta.api.pattern.behavioral.memento.PedidoMemento;
import com.dahorta.api.pattern.behavioral.state.StatusPedidoStates;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Padrão GoF: State, Memento */
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motoboy_id")
    private Usuario motoboy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cupom_id")
    private Cupom cupom;

    @Column(name = "cupom_codigo", length = 40)
    private String cupomCodigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private StatusPedido status = StatusPedido.RECEBIDO;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento", nullable = false, length = 24)
    private MetodoPagamento metodoPagamento;

    @Embedded
    private EnderecoEntrega enderecoEntrega;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "taxa_entrega", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaEntrega;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal desconto = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(length = 500)
    private String observacoes;

    @Column(name = "codigo_entrega_hash", length = 64)
    private String codigoEntregaHash;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @Version
    private Long versao;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    protected Pedido() {
    }

    public Pedido(
            Usuario cliente,
            MetodoPagamento metodoPagamento,
            EnderecoEntrega enderecoEntrega,
            BigDecimal subtotal,
            BigDecimal taxaEntrega,
            String observacoes,
            String codigoEntregaHash,
            Instant agora) {
        this.cliente = cliente;
        this.metodoPagamento = metodoPagamento;
        this.enderecoEntrega = enderecoEntrega;
        this.subtotal = subtotal;
        this.taxaEntrega = taxaEntrega;
        this.total = subtotal.add(taxaEntrega);
        this.observacoes = observacoes;
        this.codigoEntregaHash = codigoEntregaHash;
        this.criadoEm = agora;
        this.atualizadoEm = agora;
    }

    public void adicionarItem(ItemPedido item) {
        itens.add(item);
        item.associarPedido(this);
        subtotal = subtotal.add(item.getSubtotal());
        total = subtotal.add(taxaEntrega).subtract(desconto);
    }

    public void atualizarStatus(StatusPedido status, Instant atualizadoEm) {
        if (!StatusPedidoStates.para(this.status).permite(status)) {
            throw new IllegalStateException("Transição inválida: " + this.status + " para " + status + ".");
        }
        this.status = status;
        this.atualizadoEm = atualizadoEm;
    }

    public void aplicarCupom(Cupom cupom, BigDecimal desconto) {
        this.cupom = cupom;
        this.cupomCodigo = cupom == null ? null : cupom.getCodigo();
        this.desconto = desconto;
        this.total = subtotal.add(taxaEntrega).subtract(desconto);
    }

    public void atribuirMotoboy(Usuario motoboy, Instant atualizadoEm) {
        this.motoboy = motoboy;
        this.atualizadoEm = atualizadoEm;
    }

    public void confirmarEntrega(Instant atualizadoEm) {
        atualizarStatus(StatusPedido.ENTREGUE, atualizadoEm);
        this.codigoEntregaHash = null;
    }

    public PedidoMemento criarMemento() {
        return new PedidoMemento(status, atualizadoEm, motoboy);
    }

    public void restaurar(PedidoMemento memento) {
        this.status = memento.status();
        this.atualizadoEm = memento.atualizadoEm();
        this.motoboy = memento.motoboy();
    }

    public Long getId() {
        return id;
    }

    public Usuario getCliente() {
        return cliente;
    }

    public Usuario getMotoboy() {
        return motoboy;
    }

    public Cupom getCupom() { return cupom; }
    public String getCupomCodigo() { return cupomCodigo; }

    public StatusPedido getStatus() {
        return status;
    }

    public MetodoPagamento getMetodoPagamento() {
        return metodoPagamento;
    }

    public EnderecoEntrega getEnderecoEntrega() {
        return enderecoEntrega;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getTaxaEntrega() {
        return taxaEntrega;
    }

    public BigDecimal getDesconto() {
        return desconto;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public String getCodigoEntregaHash() {
        return codigoEntregaHash;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public List<ItemPedido> getItens() {
        return itens;
    }
}
