package com.dahorta.api.pattern.behavioral.visitor;

import com.dahorta.api.entity.Cupom;
import com.dahorta.api.pattern.structural.composite.ComboKitItem;
import com.dahorta.api.pattern.structural.composite.ProdutoItem;

import java.math.BigDecimal;
import java.util.Objects;

/** Padrão GoF: Visitor */
public final class CalculoImpostoVisitor implements VisitorPedido {
    private final BigDecimal aliquota;
    private BigDecimal baseTributavel = BigDecimal.ZERO;

    public CalculoImpostoVisitor(BigDecimal aliquota) {
        this.aliquota = Objects.requireNonNull(aliquota);
        if (aliquota.signum() < 0 || aliquota.compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("Alíquota deve estar entre zero e um.");
        }
    }

    @Override
    public void visitar(ProdutoItem item) {
        baseTributavel = baseTributavel.add(item.valorTotal());
    }

    @Override
    public void visitar(ComboKitItem combo) {
        combo.itens().forEach(item -> item.aceitar(this));
    }

    @Override
    public void visitar(Cupom cupom) {
        BigDecimal desconto = switch (cupom.getTipo()) {
            case PERCENTUAL -> baseTributavel.multiply(cupom.getValor()).divide(new BigDecimal("100"), 2,
                    java.math.RoundingMode.HALF_UP);
            case FIXO -> cupom.getValor().min(baseTributavel);
            case FRETE -> BigDecimal.ZERO;
        };
        baseTributavel = baseTributavel.subtract(desconto).max(BigDecimal.ZERO);
    }

    public BigDecimal imposto() {
        return baseTributavel.multiply(aliquota).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    public BigDecimal baseTributavel() {
        return baseTributavel;
    }
}
