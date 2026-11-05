package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "cupons")
public class Cupom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoDesconto tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "valor_minimo", precision = 10, scale = 2)
    private BigDecimal valorMinimo;

    @Column(name = "limite_usos")
    private Integer limiteUsos;

    @Column(name = "usos_realizados", nullable = false)
    private int usosRealizados;

    @Column(name = "expira_em")
    private Instant expiraEm;

    @Column(nullable = false)
    private boolean ativo = true;

    @Version
    private Long versao;

    protected Cupom() {
    }

    public Cupom(String codigo, TipoDesconto tipo, BigDecimal valor, BigDecimal valorMinimo,
                 Integer limiteUsos, Instant expiraEm, boolean ativo) {
        this.codigo = codigo.trim().toUpperCase();
        this.tipo = tipo;
        this.valor = valor;
        this.valorMinimo = valorMinimo;
        this.limiteUsos = limiteUsos;
        this.expiraEm = expiraEm;
        this.ativo = ativo;
    }

    public void atualizar(String codigo, TipoDesconto tipo, BigDecimal valor, BigDecimal valorMinimo,
                          Integer limiteUsos, Instant expiraEm, boolean ativo) {
        this.codigo = codigo.trim().toUpperCase();
        this.tipo = tipo;
        this.valor = valor;
        this.valorMinimo = valorMinimo;
        this.limiteUsos = limiteUsos;
        this.expiraEm = expiraEm;
        this.ativo = ativo;
    }

    public void registrarUso() {
        usosRealizados++;
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public TipoDesconto getTipo() { return tipo; }
    public BigDecimal getValor() { return valor; }
    public BigDecimal getValorMinimo() { return valorMinimo; }
    public Integer getLimiteUsos() { return limiteUsos; }
    public int getUsosRealizados() { return usosRealizados; }
    public Instant getExpiraEm() { return expiraEm; }
    public boolean isAtivo() { return ativo; }
}
