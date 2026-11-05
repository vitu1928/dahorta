package com.dahorta.api.security;

import com.dahorta.api.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationSeconds;

    public JwtService(
            @Value("${dahorta.jwt.secret}") String secret,
            @Value("${dahorta.jwt.expiration-seconds}") long expirationSeconds) {
        byte[] keyBytes = secret.startsWith("base64:")
                ? Decoders.BASE64.decode(secret.substring("base64:".length()))
                : secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET deve possuir no mínimo 32 bytes.");
        }
        if (expirationSeconds <= 0) {
            throw new IllegalArgumentException("JWT_EXPIRATION_SECONDS deve ser maior que zero.");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationSeconds = expirationSeconds;
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getUsername())
                .claim("uid", usuario.getId())
                .claim("role", usuario.getPerfil().name())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plusSeconds(expirationSeconds)))
                .signWith(signingKey)
                .compact();
    }

    public String extrairEmail(String token) {
        return claims(token).getSubject();
    }

    public boolean tokenValido(String token, UserDetails usuario) {
        Claims claims = claims(token);
        return claims.getSubject().equalsIgnoreCase(usuario.getUsername())
                && claims.getExpiration().after(new Date())
                && usuario.isEnabled();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    private Claims claims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
