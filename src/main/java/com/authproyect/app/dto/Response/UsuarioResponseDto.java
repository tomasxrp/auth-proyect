package com.authproyect.app.dto.Response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UsuarioResponseDto {
    private String email;
    private String rol;
    private String mensaje;
}
