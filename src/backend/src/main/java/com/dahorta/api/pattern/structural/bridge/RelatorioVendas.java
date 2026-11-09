package com.dahorta.api.pattern.structural.bridge;

import com.dahorta.api.entity.Pedido;

import java.util.List;
import java.util.Objects;

/** Padrão GoF: Bridge */
public final class RelatorioVendas {
    private final FormatoExportacao formato;

    public RelatorioVendas(FormatoExportacao formato) {
        this.formato = Objects.requireNonNull(formato);
    }

    public ResultadoExportacao exportar(List<Pedido> pedidos) {
        List<LinhaRelatorioVendas> linhas = pedidos.stream()
                .map(pedido -> new LinhaRelatorioVendas(
                        pedido.getId(), pedido.getStatus().name(), pedido.getTotal()))
                .toList();
        return formato.exportar(linhas);
    }
}
