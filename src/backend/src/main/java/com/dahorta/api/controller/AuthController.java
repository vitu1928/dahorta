package com.dahorta.api.controller;

import com.dahorta.api.dto.CriarContaRequestDTO;
import com.dahorta.api.dto.LoginRequestDTO;
import com.dahorta.api.dto.TokenResponseDTO;
import com.dahorta.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public TokenResponseDTO registrar(@Valid @RequestBody CriarContaRequestDTO request) {
        return authService.registrarCliente(request);
    }

    @PostMapping("/login")
    public TokenResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return authService.autenticar(request.email(), request.senha());
    }
}
