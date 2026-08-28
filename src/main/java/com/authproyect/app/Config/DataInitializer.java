package com.authproyect.app.Config;

import com.authproyect.app.Entity.Rol;
import com.authproyect.app.Repository.RolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;

    @Override
    public void run(String... args) {
        List<String> defaultRoles = List.of("USER", "ADMINISTRADOR");

        for (String roleName : defaultRoles) {
            if (rolRepository.findByNombre(roleName).isEmpty()) {
                Rol rol = new Rol();
                rol.setNombre(roleName);
                rolRepository.save(rol);
                log.info("Rol inicializado por defecto: {}", roleName);
            }
        }
    }
}
