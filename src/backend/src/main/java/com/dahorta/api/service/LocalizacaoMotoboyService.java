package com.dahorta.api.service;

import com.dahorta.api.dto.AtualizarLocalizacaoMotoboyRequestDTO;
import com.dahorta.api.dto.LocalizacaoMotoboyResponseDTO;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LocalizacaoMotoboyService {
    private static final Duration MAX_IDADE = Duration.ofMinutes(2);

    private final UsuarioRepository usuarioRepository;
    private final ConcurrentHashMap<Long, LocalizacaoMotoboyResponseDTO> localizacoes = new ConcurrentHashMap<>();

    public LocalizacaoMotoboyService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void atualizar(Authentication authentication, AtualizarLocalizacaoMotoboyRequestDTO request) {
        var usuario = usuarioRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Usuário autenticado inválido."));
        if (usuario.getPerfil() != PerfilUsuario.MOTOBOY) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Somente motoboys podem transmitir localização.");
        }

        double latitude = request.latitude();
        double longitude = request.longitude();
        if (!Double.isFinite(latitude) || latitude < -90 || latitude > 90
                || !Double.isFinite(longitude) || longitude < -180 || longitude > 180) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordenadas geográficas inválidas.");
        }
        localizacoes.put(usuario.getId(), new LocalizacaoMotoboyResponseDTO(
                latitude, longitude, Instant.now().toEpochMilli()));
    }

    public Optional<LocalizacaoMotoboyResponseDTO> buscar(Long motoboyId) {
        LocalizacaoMotoboyResponseDTO localizacao = localizacoes.get(motoboyId);
        if (localizacao == null) {
            return Optional.empty();
        }
        if (Instant.now().toEpochMilli() - localizacao.updatedAt() > MAX_IDADE.toMillis()) {
            localizacoes.remove(motoboyId, localizacao);
            return Optional.empty();
        }
        return Optional.of(localizacao);
    }
}
