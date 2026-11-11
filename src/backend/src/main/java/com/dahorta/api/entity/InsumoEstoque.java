package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;

@Entity
@Table(name = "insumos_estoque")
public class InsumoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String nome;

    @Column(nullable = false, length = 30)
    private String unidade;

    @Column(name = "quantidade_atual", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantidadeAtual = BigDecimal.ZERO;

    @Column(name = "quantidade_minima", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantidadeMinima = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(length = 80)
    private String categoria;

    @Column(length = 1000)
    private String observacoes;

    @Version
    private Long versao;

    protected InsumoEstoque() {
    }

    public InsumoEstoque(String nome, String unidade, BigDecimal quantidadeAtual, BigDecimal quantidadeMinima) {
        this(nome, unidade, quantidadeAtual, quantidadeMinima, null, null);
    }

    public InsumoEstoque(String nome, String unidade, BigDecimal quantidadeAtual, BigDecimal quantidadeMinima,
                         String categoria, String observacoes) {
        this.nome = nome;
        this.unidade = unidade;
        this.quantidadeAtual = quantidadeAtual;
        this.quantidadeMinima = quantidadeMinima;
        this.categoria = categoria;
        this.observacoes = observacoes;
    }

    public void atualizar(String nome, String unidade, BigDecimal quantidadeMinima,
                          String categoria, String observacoes) {
        this.nome = nome;
        this.unidade = unidade;
        this.quantidadeMinima = quantidadeMinima;
        this.categoria = categoria;
        this.observacoes = observacoes;
    }

    public void definirQuantidade(BigDecimal quantidade) {
        this.quantidadeAtual = quantidade;
    }

    public void desativar() {
        this.ativo = false;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getUnidade() { return unidade; }
    public BigDecimal getQuantidadeAtual() { return quantidadeAtual; }
    public BigDecimal getQuantidadeMinima() { return quantidadeMinima; }
    public boolean isAtivo() { return ativo; }
    public Long getVersao() { return versao; }
    public String getCategoria() { return categoria; }
    public String getObservacoes() { return observacoes; }
}
