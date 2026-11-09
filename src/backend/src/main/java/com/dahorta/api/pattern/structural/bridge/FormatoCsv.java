package com.dahorta.api.pattern.structural.bridge;

import java.nio.charset.StandardCharsets;
import java.util.List;

/** Padrão GoF: Bridge */
public final class FormatoCsv implements FormatoExportacao {
    @Override
    public ResultadoExportacao exportar(List<LinhaRelatorioVendas> linhas) {
        StringBuilder csv = new StringBuilder("pedido_id,status,total\n");
        linhas.forEach(linha -> csv.append(linha.pedidoId()).append(',')
                .append(linha.status()).append(',').append(linha.total()).append('\n'));
        return new ResultadoExportacao("relatorio-vendas.csv", "text/csv; charset=utf-8",
                csv.toString().getBytes(StandardCharsets.UTF_8));
    }
}
