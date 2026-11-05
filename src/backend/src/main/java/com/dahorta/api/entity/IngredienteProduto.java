package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;

@Embeddable
public class IngredienteProduto {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "insumo_id", nullable = false)
    private InsumoEstoque insumo;

    @Column(name = "quantidade_por_produto", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantidade;

    protected IngredienteProduto() {
    }

    public IngredienteProduto(InsumoEstoque insumo, BigDecimal quantidade) {
        this.insumo = insumo;
        this.quantidade = quantidade;
    }

    public InsumoEstoque getInsumo() { return insumo; }
    public BigDecimal getQuantidade() { return quantidade; }
}
