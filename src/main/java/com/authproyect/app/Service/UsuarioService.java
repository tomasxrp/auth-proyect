package com.authproyect.app.Service;

import com.authproyect.app.Entity.Rol;
import com.authproyect.app.Entity.Usuario;
import com.authproyect.app.Repository.RolRepository;
import com.authproyect.app.Repository.UsuarioRepository;
import com.authproyect.app.Utils.HasherContrasena;
import com.authproyect.app.Utils.VerificadorContrasena;
import com.authproyect.app.dto.MapperDto;
import com.authproyect.app.dto.Response.UsuarioResponseDto;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UsuarioService {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final EmailService emailService;

    @Transactional
    public UsuarioResponseDto crearUsuario(String email, String contrasena, String rol) {
        // Se verifica si el usuario existe en la base de datos
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("El email se encuentra registrado en la base de datos");
        }

        // Se verifica que el rol exista en la base de datos
        Rol rolEncontrado = rolRepository.findByNombre(rol)
                .orElseThrow(() -> new NoSuchElementException("El rol no existe en la base de datos"));

        // Se encripta la contrasena que sera guardada en la base de datos
        String contrasenaHash = HasherContrasena.encriptarContrasena(contrasena);

        // Guardar usuario en bd
        Usuario usuarioGuardado = new Usuario(email, contrasenaHash, rolEncontrado);
        usuarioRepository.save(usuarioGuardado);

        emailService.enviarCorreoBienvenida(email);

        return MapperDto.toDto(usuarioGuardado);
    }

    @Transactional(readOnly = true)
    // Despues deberia retornar un token JWT
    public String login(String email, String contrasena) {
        Optional<Usuario> usuarioEncontrado = usuarioRepository.findByEmail(email);

        if (usuarioEncontrado.isEmpty()) {
            throw new AuthenticationCredentialsNotFoundException("Usuario o contraseña incorrectas");
        }

        if (!VerificadorContrasena.validarContrasena(contrasena, usuarioEncontrado.get().getContrasena())) {
            throw new AuthenticationCredentialsNotFoundException("Usuario o contraseña incorrectas");
        }

        return tokenService.generarToken(email,usuarioEncontrado.get().getRol().getNombre());
    }

    public Boolean validarToken(String token) throws Exception {
        boolean esValido = tokenService.validarToken(token);
        if (!esValido){
            throw new Exception("El token no es valido");
        }

        return true;
    }
}
