package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "pratos_dia")
public class PratoDia {
    @Id
    @Column(name = "dia_semana")
    private Integer diaSemana;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    protected PratoDia() {}

    public PratoDia(Integer diaSemana, Produto produto) {
        this.diaSemana = diaSemana;
        this.produto = produto;
    }

    public Integer getDiaSemana() { return diaSemana; }
    public Produto getProduto() { return produto; }
}
