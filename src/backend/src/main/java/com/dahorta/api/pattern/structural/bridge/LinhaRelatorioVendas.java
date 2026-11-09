package com.dahorta.api.pattern.structural.bridge;

import java.math.BigDecimal;

/** Padrão GoF: Bridge */
public record LinhaRelatorioVendas(Long pedidoId, String status, BigDecimal total) {
}
