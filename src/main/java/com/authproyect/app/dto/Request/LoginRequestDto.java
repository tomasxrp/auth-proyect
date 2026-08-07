package com.authproyect.app.dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequestDto {
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo electronico debe cumplir con el formato")
    private String email;

    @NotBlank(message = "La contrasena no puede estar vacia")
    private String contrasena;
}
