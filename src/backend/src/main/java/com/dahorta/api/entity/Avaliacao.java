package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "avaliacoes")
public class Avaliacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private Pedido pedido;

    @Column(nullable = false)
    private int estrelas;

    @Column(length = 1000)
    private String comentario;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Avaliacao() {}

    public Avaliacao(Pedido pedido, int estrelas, String comentario) {
        this.pedido = pedido;
        this.estrelas = estrelas;
        this.comentario = comentario;
        this.criadoEm = Instant.now();
    }

    public Long getId() { return id; }
    public Pedido getPedido() { return pedido; }
    public int getEstrelas() { return estrelas; }
    public String getComentario() { return comentario; }
    public Instant getCriadoEm() { return criadoEm; }
}
