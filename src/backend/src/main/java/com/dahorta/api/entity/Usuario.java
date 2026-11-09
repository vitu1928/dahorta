package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/** Padrão GoF: Adapter */
@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 190)
    private String email;

    @Column(length = 30)
    private String telefone;

    @Column(name = "senha_hash", nullable = false, length = 100)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PerfilUsuario perfil;

    @Column(nullable = false)
    private boolean ativo = true;

    protected Usuario() {
    }

    public Usuario(String nome, String email, String senhaHash, PerfilUsuario perfil) {
        this(nome, email, senhaHash, perfil, null);
    }

    public Usuario(String nome, String email, String senhaHash, PerfilUsuario perfil, String telefone) {
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.perfil = perfil;
        this.telefone = telefone;
    }

    public void atualizarPerfil(String nome, String telefone, PerfilUsuario perfil, boolean ativo) {
        this.nome = nome;
        this.telefone = telefone;
        this.perfil = perfil;
        this.ativo = ativo;
    }

    public void atualizarDadosPessoais(String nome, String email, String telefone) {
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
    }

    public void atualizarSenha(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public void desativar() {
        this.ativo = false;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefone() {
        return telefone;
    }

    public PerfilUsuario getPerfil() {
        return perfil;
    }

    public boolean isAtivo() {
        return ativo;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + perfil.name()));
    }

    @Override
    public String getPassword() {
        return senhaHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }
}
