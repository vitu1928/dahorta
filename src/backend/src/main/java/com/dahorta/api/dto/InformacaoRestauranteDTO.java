package com.dahorta.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InformacaoRestauranteDTO(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 250) String tagline,
        @NotBlank @Size(max = 30) String phone,
        @NotBlank @Size(max = 30) String whatsapp,
        @NotBlank @Email @Size(max = 190) String email,
        @NotBlank @Size(max = 250) String address,
        @NotBlank @Size(max = 100) String city,
        @NotNull @DecimalMin("0.0") double deliveryFee,
        @NotBlank @Size(max = 60) String deliveryTime,
        @NotNull @DecimalMin("0.0") double minOrder,
        @NotBlank @Size(max = 250) String instagram,
        @NotBlank @Size(max = 250) String website
) {}
