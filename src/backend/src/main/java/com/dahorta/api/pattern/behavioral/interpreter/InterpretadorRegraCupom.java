package com.dahorta.api.pattern.behavioral.interpreter;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Padrão GoF: Interpreter */
public final class InterpretadorRegraCupom {
    private static final Pattern VALOR_MAIOR = Pattern.compile("^VALOR\\s*>\\s*(\\d+(?:\\.\\d{1,2})?)$");
    private static final Pattern CATEGORIA_IGUAL = Pattern.compile("^CATEGORIA\\s*==\\s*([\\p{L}0-9 _-]+)$");

    public ExpressaoRegra interpretar(String regra) {
        if (regra == null || regra.isBlank()) {
            throw new IllegalArgumentException("A regra do cupom é obrigatória.");
        }
        String[] termos = regra.trim().split("\\s+AND\\s+", -1);
        if (termos.length == 0) {
            throw new IllegalArgumentException("Regra do cupom inválida.");
        }
        ExpressaoRegra expressao = interpretarTermo(termos[0]);
        for (int i = 1; i < termos.length; i++) {
            ExpressaoRegra proxima = interpretarTermo(termos[i]);
            ExpressaoRegra anterior = expressao;
            expressao = contexto -> anterior.interpretar(contexto) && proxima.interpretar(contexto);
        }
        return expressao;
    }

    private ExpressaoRegra interpretarTermo(String termo) {
        String normalizado = termo.trim();
        Matcher valor = VALOR_MAIOR.matcher(normalizado);
        if (valor.matches()) {
            BigDecimal limite = new BigDecimal(valor.group(1));
            return contexto -> contexto.valor() != null && contexto.valor().compareTo(limite) > 0;
        }
        Matcher categoria = CATEGORIA_IGUAL.matcher(normalizado);
        if (categoria.matches()) {
            String esperada = normalizar(categoria.group(1));
            return contexto -> contexto.categoria() != null
                    && normalizar(contexto.categoria()).equals(esperada);
        }
        throw new IllegalArgumentException("Termo não suportado na regra de cupom: " + termo);
    }

    private String normalizar(String valor) {
        return valor.trim().replaceAll("\\s+", " ").toUpperCase(Locale.ROOT);
    }
}
