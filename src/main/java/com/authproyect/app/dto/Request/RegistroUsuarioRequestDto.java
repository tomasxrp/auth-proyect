package com.authproyect.app.dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistroUsuarioRequestDto {
    @Email(message = "El dato ingresado debe ser un Email Valido")
    @NotBlank(message = "El email es obligatorio")
    @Size(max = 100, message = "El maximo de caracteres es 100")
    private String email;

    @NotBlank(message = "La contrasena es obligatoria")
    @Size(min = 8, max = 100, message = "La contrasena debe tener entre 8 y 100 caracteres")
    private String contrasena;

    @NotBlank(message = "El rol no debe ser nulo")
    private String rol;

}
