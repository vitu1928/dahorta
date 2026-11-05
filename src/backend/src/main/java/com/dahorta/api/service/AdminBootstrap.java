package com.dahorta.api.service;

import com.dahorta.api.entity.PerfilUsuario;
import com.dahorta.api.entity.Usuario;
import com.dahorta.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
public class AdminBootstrap implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String senha;

    public AdminBootstrap(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${dahorta.admin.email:}") String email,
            @Value("${dahorta.admin.password:}") String senha) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.senha = senha;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() || senha.isBlank()) {
            return;
        }
        if (senha.length() < 8 || senha.length() > 72) {
            throw new IllegalArgumentException("ADMIN_PASSWORD deve ter entre 8 e 72 caracteres.");
        }
        String emailNormalizado = email.trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.findByEmailIgnoreCase(emailNormalizado).isEmpty()) {
            usuarioRepository.save(new Usuario(
                    "Administrador",
                    emailNormalizado,
                    passwordEncoder.encode(senha),
                    PerfilUsuario.ADMIN));
        }
    }
}
