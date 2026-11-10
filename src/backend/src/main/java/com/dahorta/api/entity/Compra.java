package com.dahorta.api.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "compras")
public class Compra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    @Column(name = "criada_em", nullable = false, updatable = false)
    private Instant criadaEm;
    @Column(name = "recebida_em")
    private Instant recebidaEm;
    @Column(length = 500)
    private String observacao;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;
    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCompra> itens = new ArrayList<>();

    protected Compra() {}

    public Compra(Fornecedor fornecedor, Usuario usuario, String observacao) {
        this.fornecedor = fornecedor;
        this.usuario = usuario;
        this.observacao = observacao;
        this.criadaEm = Instant.now();
        this.total = BigDecimal.ZERO;
    }

    public void adicionarItem(ItemCompra item) {
        itens.add(item);
        item.associarCompra(this);
        total = total.add(item.getSubtotal());
    }

    public void receber(Instant instante) { this.recebidaEm = instante; }
    public Long getId() { return id; }
    public Fornecedor getFornecedor() { return fornecedor; }
    public Usuario getUsuario() { return usuario; }
    public Instant getCriadaEm() { return criadaEm; }
    public Instant getRecebidaEm() { return recebidaEm; }
    public String getObservacao() { return observacao; }
    public BigDecimal getTotal() { return total; }
    public List<ItemCompra> getItens() { return itens; }
}
