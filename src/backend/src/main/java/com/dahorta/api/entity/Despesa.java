package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "despesas")
public class Despesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 80)
    private String categoria;
    @Column(nullable = false, length = 180)
    private String descricao;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;
    @Column(nullable = false)
    private LocalDate data;
    @Column(nullable = false)
    private boolean recorrente;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Despesa() {}
    public Despesa(String categoria, String descricao, BigDecimal valor,
                   LocalDate data, boolean recorrente, String status) {
        this.categoria = categoria;
        this.descricao = descricao;
        this.valor = valor;
        this.data = data;
        this.recorrente = recorrente;
        this.status = status;
        this.criadoEm = Instant.now();
    }
    public void atualizar(String categoria, String descricao, BigDecimal valor,
                          LocalDate data, boolean recorrente, String status) {
        this.categoria = categoria;
        this.descricao = descricao;
        this.valor = valor;
        this.data = data;
        this.recorrente = recorrente;
        this.status = status;
    }
    public Long getId() { return id; }
    public String getCategoria() { return categoria; }
    public String getDescricao() { return descricao; }
    public BigDecimal getValor() { return valor; }
    public LocalDate getData() { return data; }
    public boolean isRecorrente() { return recorrente; }
    public String getStatus() { return status; }
    public Instant getCriadoEm() { return criadoEm; }
}
