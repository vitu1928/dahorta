package com.dahorta.api.service;

import com.dahorta.api.entity.Cupom;
import com.dahorta.api.entity.TipoDesconto;
import com.dahorta.api.repository.CupomRepository;
import com.dahorta.api.repository.ProdutoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CupomServiceTest {

    private final CupomService cupomService = new CupomService(
            mock(CupomRepository.class), mock(ProdutoRepository.class));

    @Test
    void calculaPercentualArredondadoEmCentavos() {
        Cupom cupom = mock(Cupom.class);
        when(cupom.isAtivo()).thenReturn(true);
        when(cupom.getLimiteUsos()).thenReturn(null);
        when(cupom.getTipo()).thenReturn(TipoDesconto.PERCENTUAL);
        when(cupom.getValor()).thenReturn(new BigDecimal("10"));

        BigDecimal desconto = cupomService.calcularDesconto(
                cupom, new BigDecimal("12.35"), new BigDecimal("15.00"));

        assertEquals(new BigDecimal("1.24"), desconto);
    }

    @Test
    void limitaCupomFixoAoTotalDoPedido() {
        Cupom cupom = mock(Cupom.class);
        when(cupom.isAtivo()).thenReturn(true);
        when(cupom.getLimiteUsos()).thenReturn(null);
        when(cupom.getTipo()).thenReturn(TipoDesconto.FIXO);
        when(cupom.getValor()).thenReturn(new BigDecimal("100"));

        BigDecimal desconto = cupomService.calcularDesconto(
                cupom, new BigDecimal("20.00"), new BigDecimal("15.00"));

        assertEquals(new BigDecimal("35.00"), desconto);
    }

    @Test
    void rejeitaCupomExpirado() {
        Cupom cupom = mock(Cupom.class);
        when(cupom.isAtivo()).thenReturn(true);
        when(cupom.getExpiraEm()).thenReturn(Instant.now().minusSeconds(1));

        assertThrows(ResponseStatusException.class, () -> cupomService.calcularDesconto(
                cupom, new BigDecimal("20.00"), new BigDecimal("15.00")));
    }
}
