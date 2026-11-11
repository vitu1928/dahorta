package com.dahorta.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ComboSlotDTO(
        @NotBlank @Size(max = 80) String id,
        @NotBlank @Size(max = 120) String name,
        @Size(max = 40) String type,
        @Size(max = 100) List<@NotBlank @Size(max = 32) String> products,
        Boolean allowSwap
) {
}
