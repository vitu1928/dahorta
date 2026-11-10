package com.dahorta.api.service;

import com.dahorta.api.dto.InformacaoRestauranteDTO;
import com.dahorta.api.entity.InformacaoRestaurante;
import com.dahorta.api.repository.InformacaoRestauranteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RestauranteDetalhesService {
    private final InformacaoRestauranteRepository repository;
    public RestauranteDetalhesService(InformacaoRestauranteRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public InformacaoRestauranteDTO buscar() {
        return repository.findById(1L).map(this::dto).orElse(null);
    }

    @Transactional
    public InformacaoRestauranteDTO atualizar(InformacaoRestauranteDTO dto) {
        InformacaoRestaurante info = repository.findById(1L).orElseGet(InformacaoRestaurante::new);
        info.atualizar(dto.name(), dto.tagline(), dto.phone(), dto.whatsapp(), dto.email(), dto.address(),
                dto.city(), dto.deliveryFee(), dto.deliveryTime(), dto.minOrder(), dto.instagram(), dto.website());
        return dto(repository.save(info));
    }

    private InformacaoRestauranteDTO dto(InformacaoRestaurante info) {
        return new InformacaoRestauranteDTO(info.getNome(), info.getSlogan(), info.getTelefone(),
                info.getWhatsapp(), info.getEmail(), info.getEndereco(), info.getCidade(),
                info.getTaxaEntrega(), info.getTempoEntrega(), info.getPedidoMinimo(),
                info.getInstagram(), info.getWebsite());
    }
}
