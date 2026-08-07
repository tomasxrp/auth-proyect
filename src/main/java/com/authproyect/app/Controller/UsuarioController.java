package com.authproyect.app.Controller;

import com.authproyect.app.Service.UsuarioService;
import com.authproyect.app.dto.Request.LoginRequestDto;
import com.authproyect.app.dto.Request.RegistroUsuarioRequestDto;
import com.authproyect.app.dto.Response.UsuarioResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.annotation.*;

import javax.naming.AuthenticationException;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponseDto> registrar(@Valid @RequestBody RegistroUsuarioRequestDto dto) {
        UsuarioResponseDto respuesta = usuarioService.crearUsuario(dto.getEmail(), dto.getContrasena(), dto.getRol());
        return ResponseEntity.status(HttpStatusCode.valueOf(201)).body(respuesta);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequestDto dto){
        boolean loginExitoso = usuarioService.login(dto.getEmail(), dto.getContrasena());
        return ResponseEntity.status(HttpStatusCode.valueOf(200)).body("LOGIN EXITOSO");
    }


    //Captura de excepciones de el service
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleEmailDuplicado(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatusCode.valueOf(409))
                .body(Map.of("error", exception.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleRolNoEncontrado(NoSuchElementException exception) {
        return ResponseEntity.status(HttpStatusCode.valueOf(404))
                .body(Map.of("error", exception.getMessage()));
    }


    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleCredencialesNoValidas(AuthenticationCredentialsNotFoundException exception){
        return ResponseEntity.status(HttpStatusCode.valueOf(401))
                .body(Map.of("error", exception.getMessage()));
    }




}
