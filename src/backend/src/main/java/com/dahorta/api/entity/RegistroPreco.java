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
import java.time.Instant;

@Entity
@Table(name = "registros_preco")
public class RegistroPreco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "insumo_id", nullable = false)
    private InsumoEstoque insumo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private Instant data;

    @Column(length = 300)
    private String observacao;

    protected RegistroPreco() {
    }

    public RegistroPreco(InsumoEstoque insumo, Fornecedor fornecedor, BigDecimal valor,
                         Instant data, String observacao) {
        atualizar(insumo, fornecedor, valor, data, observacao);
    }

    public void atualizar(InsumoEstoque insumo, Fornecedor fornecedor, BigDecimal valor,
                          Instant data, String observacao) {
        this.insumo = insumo;
        this.fornecedor = fornecedor;
        this.valor = valor;
        this.data = data;
        this.observacao = observacao;
    }

    public Long getId() { return id; }
    public InsumoEstoque getInsumo() { return insumo; }
    public Fornecedor getFornecedor() { return fornecedor; }
    public BigDecimal getValor() { return valor; }
    public Instant getData() { return data; }
    public String getObservacao() { return observacao; }
}
