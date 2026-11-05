package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "configuracao_restaurante")
public class ConfiguracaoRestaurante {

    @Id
    private Long id;

    @Column(nullable = false)
    private boolean aberto;

    @Version
    private Long versao;

    protected ConfiguracaoRestaurante() {
    }

    public ConfiguracaoRestaurante(Long id, boolean aberto) {
        this.id = id;
        this.aberto = aberto;
    }

    public void definirAberto(boolean aberto) {
        this.aberto = aberto;
    }

    public Long getId() { return id; }
    public boolean isAberto() { return aberto; }
}
