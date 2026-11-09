package com.dahorta.api.pattern.structural.bridge;

import java.util.Arrays;

/** Padrão GoF: Bridge */
public record ResultadoExportacao(String nomeArquivo, String contentType, byte[] conteudo) {
    public ResultadoExportacao {
        conteudo = Arrays.copyOf(conteudo, conteudo.length);
    }

    @Override
    public byte[] conteudo() {
        return Arrays.copyOf(conteudo, conteudo.length);
    }
}
