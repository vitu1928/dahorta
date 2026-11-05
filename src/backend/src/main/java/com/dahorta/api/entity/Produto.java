package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(nullable = false)
    private boolean disponivel = true;

    @Column(length = 1000)
    private String descricao;

    @Column(length = 500)
    private String imagem;

    @Column(name = "categoria", length = 80)
    private String categoria;

    @ElementCollection
    @CollectionTable(name = "ficha_tecnica_produto", joinColumns = @JoinColumn(name = "produto_id"))
    private List<IngredienteProduto> ingredientes = new ArrayList<>();

    protected Produto() {
    }

    public Produto(String nome, BigDecimal preco, boolean disponivel) {
        this.nome = nome;
        this.preco = preco;
        this.disponivel = disponivel;
    }

    public Produto(String nome, String descricao, String imagem, String categoria, BigDecimal preco,
                   boolean disponivel, List<IngredienteProduto> ingredientes) {
        this.nome = nome;
        this.descricao = descricao;
        this.imagem = imagem;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;
        substituirIngredientes(ingredientes);
    }

    public void atualizar(String nome, String descricao, String imagem, String categoria,
                          BigDecimal preco, boolean disponivel, List<IngredienteProduto> ingredientes) {
        this.nome = nome;
        this.descricao = descricao;
        this.imagem = imagem;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;
        substituirIngredientes(ingredientes);
    }

    public void definirDisponivel(boolean disponivel) {
        this.disponivel = disponivel;
    }

    private void substituirIngredientes(List<IngredienteProduto> novosIngredientes) {
        this.ingredientes.clear();
        if (novosIngredientes != null) {
            this.ingredientes.addAll(novosIngredientes);
        }
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public boolean isDisponivel() {
        return disponivel;
    }

    public String getDescricao() { return descricao; }
    public String getImagem() { return imagem; }
    public String getCategoria() { return categoria; }
    public List<IngredienteProduto> getIngredientes() { return ingredientes; }
}
