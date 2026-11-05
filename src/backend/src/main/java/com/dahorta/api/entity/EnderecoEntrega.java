package com.dahorta.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class EnderecoEntrega {

    @Column(name = "endereco_rotulo", length = 60)
    private String rotulo;

    @Column(name = "endereco_rua", nullable = false, length = 160)
    private String rua;

    @Column(name = "endereco_numero", nullable = false, length = 20)
    private String numero;

    @Column(name = "endereco_complemento", length = 100)
    private String complemento;

    @Column(name = "endereco_bairro", nullable = false, length = 100)
    private String bairro;

    @Column(name = "endereco_cidade", nullable = false, length = 100)
    private String cidade;

    @Column(name = "endereco_cep", nullable = false, length = 9)
    private String cep;

    protected EnderecoEntrega() {
    }

    public EnderecoEntrega(
            String rotulo,
            String rua,
            String numero,
            String complemento,
            String bairro,
            String cidade,
            String cep) {
        this.rotulo = rotulo;
        this.rua = rua;
        this.numero = numero;
        this.complemento = complemento;
        this.bairro = bairro;
        this.cidade = cidade;
        this.cep = cep;
    }

    public String getRotulo() {
        return rotulo;
    }

    public String getRua() {
        return rua;
    }

    public String getNumero() {
        return numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public String getCep() {
        return cep;
    }
}
