package com.dahorta.api.pattern.creational;

import java.util.Map;
import java.util.Objects;

/** Padrão GoF: Prototype */
public record ConfiguracaoRelatorio(String titulo, String formato, Map<String, String> parametros) {
    public ConfiguracaoRelatorio {
        Objects.requireNonNull(titulo);
        Objects.requireNonNull(formato);
        parametros = Map.copyOf(parametros);
    }

    public ConfiguracaoRelatorio copiar() {
        return new ConfiguracaoRelatorio(titulo, formato, parametros);
    }
}
