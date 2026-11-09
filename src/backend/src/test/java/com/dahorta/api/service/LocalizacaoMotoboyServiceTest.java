package com.dahorta.api.service;

import com.dahorta.api.dto.AtualizarLocalizacaoMotoboyRequestDTO;
import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.Usuario;
import com.dahorta.api.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LocalizacaoMotoboyServiceTest {
    private final UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
    private final LocalizacaoMotoboyService service = new LocalizacaoMotoboyService(usuarioRepository);
    private final Authentication authentication = mock(Authentication.class);

    @Test
    void motoboyPodeAtualizarEConsultarPosicaoRecente() {
        String email = "moto@dahorta.test";
        Usuario motoboy = mock(Usuario.class);
        when(motoboy.getId()).thenReturn(42L);
        when(motoboy.getEmail()).thenReturn(email);
        when(motoboy.getPerfil()).thenReturn(PerfilUsuario.MOTOBOY);
        when(authentication.getName()).thenReturn(email);
        when(usuarioRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(motoboy));

        service.atualizar(authentication, new AtualizarLocalizacaoMotoboyRequestDTO(-23.5, -46.6));

        var localizacao = service.buscar(motoboy.getId()).orElseThrow();
        assertEquals(-23.5, localizacao.latitude());
        assertEquals(-46.6, localizacao.longitude());
        assertTrue(localizacao.updatedAt() > 0);
    }

    @Test
    void rejeitaCoordenadasForaDosLimites() {
        String email = "moto@dahorta.test";
        Usuario motoboy = mock(Usuario.class);
        when(motoboy.getId()).thenReturn(42L);
        when(motoboy.getEmail()).thenReturn(email);
        when(motoboy.getPerfil()).thenReturn(PerfilUsuario.MOTOBOY);
        when(authentication.getName()).thenReturn(email);
        when(usuarioRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(motoboy));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.atualizar(authentication, new AtualizarLocalizacaoMotoboyRequestDTO(91.0, 0.0)));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void clienteNaoPodePublicarLocalizacao() {
        String email = "cliente@dahorta.test";
        Usuario cliente = mock(Usuario.class);
        when(cliente.getId()).thenReturn(42L);
        when(cliente.getEmail()).thenReturn(email);
        when(cliente.getPerfil()).thenReturn(PerfilUsuario.CLIENTE);
        when(authentication.getName()).thenReturn(email);
        when(usuarioRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.of(cliente));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.atualizar(authentication, new AtualizarLocalizacaoMotoboyRequestDTO(0.0, 0.0)));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
    }
}
