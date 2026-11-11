package com.dahorta.api.entity;

import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "enderecos_salvos")
public class EnderecoSalvo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Embedded
    private EnderecoEntrega endereco;

    protected EnderecoSalvo() {
    }

    public EnderecoSalvo(Usuario usuario, EnderecoEntrega endereco) {
        this.usuario = usuario;
        this.endereco = endereco;
    }

    public void atualizar(EnderecoEntrega endereco) {
        this.endereco = endereco;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public EnderecoEntrega getEndereco() { return endereco; }
}
