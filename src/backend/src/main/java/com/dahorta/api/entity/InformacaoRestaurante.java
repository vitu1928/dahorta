package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "informacao_restaurante")
public class InformacaoRestaurante {
    @Id
    private Long id;
    @Column(nullable = false, length = 120)
    private String nome;
    @Column(nullable = false, length = 250)
    private String slogan;
    @Column(nullable = false, length = 30)
    private String telefone;
    @Column(nullable = false, length = 30)
    private String whatsapp;
    @Column(nullable = false, length = 190)
    private String email;
    @Column(nullable = false, length = 250)
    private String endereco;
    @Column(nullable = false, length = 100)
    private String cidade;
    @Column(name = "taxa_entrega", nullable = false)
    private double taxaEntrega;
    @Column(name = "tempo_entrega", nullable = false, length = 60)
    private String tempoEntrega;
    @Column(name = "pedido_minimo", nullable = false)
    private double pedidoMinimo;
    @Column(nullable = false, length = 250)
    private String instagram;
    @Column(nullable = false, length = 250)
    private String website;
    @Column(name = "price_validity_days", nullable = false, columnDefinition = "integer not null default 60")
    private int priceValidityDays = 60;

    public InformacaoRestaurante() {}

    public void atualizar(String nome, String slogan, String telefone, String whatsapp, String email,
                          String endereco, String cidade, double taxaEntrega, String tempoEntrega,
                          double pedidoMinimo, String instagram, String website, Integer priceValidityDays) {
        this.id = 1L;
        this.nome = nome;
        this.slogan = slogan;
        this.telefone = telefone;
        this.whatsapp = whatsapp;
        this.email = email;
        this.endereco = endereco;
        this.cidade = cidade;
        this.taxaEntrega = taxaEntrega;
        this.tempoEntrega = tempoEntrega;
        this.pedidoMinimo = pedidoMinimo;
        this.instagram = instagram;
        this.website = website;
        this.priceValidityDays = priceValidityDays == null ? 60 : priceValidityDays;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getSlogan() { return slogan; }
    public String getTelefone() { return telefone; }
    public String getWhatsapp() { return whatsapp; }
    public String getEmail() { return email; }
    public String getEndereco() { return endereco; }
    public String getCidade() { return cidade; }
    public double getTaxaEntrega() { return taxaEntrega; }
    public String getTempoEntrega() { return tempoEntrega; }
    public double getPedidoMinimo() { return pedidoMinimo; }
    public String getInstagram() { return instagram; }
    public String getWebsite() { return website; }
    public int getPriceValidityDays() { return priceValidityDays; }
}
