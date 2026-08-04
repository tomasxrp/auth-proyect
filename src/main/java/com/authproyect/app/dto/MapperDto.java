package com.authproyect.app.dto;

import com.authproyect.app.Entity.Usuario;
import com.authproyect.app.dto.Response.UsuarioResponseDto;

public class MapperDto {
    public static UsuarioResponseDto toDto(Usuario usuario) {
        return UsuarioResponseDto.builder()
                .email(usuario.getEmail())
                .rol(usuario.getRol().getNombre())
                .mensaje("Usuario creado con exito")
                .build();
    }
}
