package com.dahorta.api.pattern.structural.bridge;

import java.util.List;

/** Padrão GoF: Bridge */
@FunctionalInterface
public interface FormatoExportacao {
    ResultadoExportacao exportar(List<LinhaRelatorioVendas> linhas);
}
