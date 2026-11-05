package com.dahorta.api.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MetodoPagamento {
    PIX("pix"),
    CARTAO_CREDITO("credit_card"),
    CARTAO_DEBITO("debit_card"),
    VALE_REFEICAO("meal_voucher"),
    DINHEIRO("cash");

    private final String valorApi;

    MetodoPagamento(String valorApi) {
        this.valorApi = valorApi;
    }

    @JsonValue
    public String getValorApi() {
        return valorApi;
    }

    @JsonCreator
    public static MetodoPagamento fromValorApi(String valor) {
        for (MetodoPagamento metodo : values()) {
            if (metodo.valorApi.equalsIgnoreCase(valor) || metodo.name().equalsIgnoreCase(valor)) {
                return metodo;
            }
        }
        throw new IllegalArgumentException("Método de pagamento inválido.");
    }
}
