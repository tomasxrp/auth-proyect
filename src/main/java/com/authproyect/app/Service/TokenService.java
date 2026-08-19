//Funciones obligatorias a implementar en el JWT service
//Generar el token
//Validar el token
//Extraer el email del token para validar las peticiones

package com.authproyect.app.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class TokenService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expiration;

    public String extraerEmail(String token) {
        return obtenerClaims(token).getSubject();
    }

    public String extraerRol(String token){
        return obtenerClaims(token).get("rol", String.class);
    }

    private Claims obtenerClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSecretKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generarToken(String email, String rol) {
        Date ahora = new Date();
        Date fechaExpiracion = new Date(ahora.getTime() + expiration);

        return Jwts.builder()
                .subject(email)
                .claim("rol", rol)
                .issuedAt(ahora)
                .expiration(fechaExpiracion)
                .signWith(getSecretKey())
                .compact();
    }

    public boolean validarToken(String token) {
        try {
            Claims claims = obtenerClaims(token);

            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
