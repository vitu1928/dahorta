package com.dahorta.api.dto;

import java.math.BigDecimal;

public record ValidarCupomResponseDTO(String codigo, BigDecimal subtotal, BigDecimal desconto,
                                      BigDecimal totalComDesconto) {
}
