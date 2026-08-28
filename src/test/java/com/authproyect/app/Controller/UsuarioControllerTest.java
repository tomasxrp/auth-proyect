package com.authproyect.app.Controller;

import com.authproyect.app.Controller.UsuarioController;
import com.authproyect.app.Service.UsuarioService;
import com.authproyect.app.dto.Response.UsuarioResponseDto;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioController.class)
public class UsuarioControllerTest {

    @Autowired
    //Herramienta para el cliente HTTP falso
    private MockMvc mockMvc;

    @Autowired
    //Objeto para transformar objetos java en JSON
    private JsonMapper objectMapper;

    @Autowired
    private UsuarioService usuarioService;


    @Test
    void registrar_DeberiaRetornar201_cuandoRegistroEsExitoso() throws Exception{
        String payload = """
                {
                    "email" : "test@ejemplo.cl",
                    "contrasena" : "Administrador123",
                    "rol" : "ADMINISTRADOR"
                }              
                """;


        UsuarioResponseDto mockRespuesta = UsuarioResponseDto.builder()
                .email("test@ejemplo.cl")
                .rol("ADMINISTRADOR")
                .build();

        Mockito.when(usuarioService.crearUsuario("test@ejemplo.cl" , "Administrador123" , "ADMINISTRADOR"))
                .thenReturn(mockRespuesta);


        mockMvc.perform(post("/api/usuarios/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated()) // Valida HTTP 201
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.rol").value("USER"));


    }

    @Test
    void registrar_DeberiaRetornar409_cuandoEmailExiste() throws Exception{
        String payload = "{\"email\":\"duplicado@example.com\",\"contrasena\":\"123\",\"rol\":\"USER\"}";

        Mockito.when(usuarioService.crearUsuario(anyString(), anyString(), anyString()))
                .thenThrow(new IllegalArgumentException("El email se encuentra registrado en la base de datos"));

        // When & Then
        mockMvc.perform(post("/api/usuarios/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("El email se encuentra registrado en la base de datos"));
    }

    @Test
    void registrar_DeberiaRetornar404_CuandoElRolNoExiste() throws Exception {
        String jsonPayload = "{\"email\":\"test@example.com\",\"contrasena\":\"123\",\"rol\":\"INVALID_ROL\"}";

        Mockito.when(usuarioService.crearUsuario(anyString(), anyString(), anyString()))
                .thenThrow(new NoSuchElementException("El rol no existe en la base de datos"));

        // When & Then
        mockMvc.perform(post("/api/usuarios/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("El rol no existe en la base de datos"));
    }
}
