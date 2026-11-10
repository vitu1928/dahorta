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
import java.util.Optional;

@Component
public class TeamBootstrap implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String kitchenEmail;
    private final String kitchenPassword;
    private final String deliveryEmail;
    private final String deliveryPassword;

    public TeamBootstrap(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${dahorta.team.kitchen.email:}") String kitchenEmail,
            @Value("${dahorta.team.kitchen.password:}") String kitchenPassword,
            @Value("${dahorta.team.delivery.email:}") String deliveryEmail,
            @Value("${dahorta.team.delivery.password:}") String deliveryPassword) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.kitchenEmail = kitchenEmail;
        this.kitchenPassword = kitchenPassword;
        this.deliveryEmail = deliveryEmail;
        this.deliveryPassword = deliveryPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        provisionar("Equipe de Cozinha", kitchenEmail, kitchenPassword, PerfilUsuario.COZINHA);
        provisionar("Entregador", deliveryEmail, deliveryPassword, PerfilUsuario.MOTOBOY);
    }

    private void provisionar(String nome, String email, String senha, PerfilUsuario perfil) {
        if (email.isBlank() && senha.isBlank()) {
            return;
        }
        if (email.isBlank() || senha.isBlank()) {
            throw new IllegalStateException("E-mail e senha devem ser configurados juntos para " + perfil + ".");
        }
        if (senha.length() < 8 || senha.length() > 72) {
            throw new IllegalArgumentException("A senha de " + perfil + " deve ter entre 8 e 72 caracteres.");
        }

        String emailNormalizado = email.trim().toLowerCase(Locale.ROOT);
        Optional<Usuario> existente = usuarioRepository.findByEmailIgnoreCase(emailNormalizado);
        if (existente.isPresent()) {
            if (existente.get().getPerfil() != perfil) {
                throw new IllegalStateException("O e-mail configurado para " + perfil
                        + " ja pertence a outro perfil.");
            }
            return;
        }

        usuarioRepository.save(new Usuario(
                nome, emailNormalizado, passwordEncoder.encode(senha), perfil));
    }
}
