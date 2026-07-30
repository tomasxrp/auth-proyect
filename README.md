# auth-proyect
Esta aplicacion que brinda servicios de autenticacion y autorizacion construidos en Java y Spring boot. Este proyecto tiene como objetivo poner en practica mis conocimientos, brindado un sistema de entrada seguro.

## Estrategia de Branching (GitHub Flow)
*   **`main`**: Es la rama de producción. El código aquí siempre debe ser estable, testeado y funcional. Nunca se trabaja directamente sobre esta rama.
*   **`develop`**: Rama de integracion. Todas las nuevas características se unen aquí para ser probadas en conjunto antes de pasar al main.
*   **`feature/<nombre>`**: Cada nueva funcionalidad, endpoint o configuración se desarrolla en su propia rama `feature` (ej: `feature/login-jwt`, `feature/configuracion-postgres`).

## Estándares de desarrollo
*   **camelCase:** Usado para nombrar variables, atributos y métodos
*   **PascalCase:** Usado para nombrar Clases, Interfaces y DTOs

### Convención de Commits
*   `feat:` Para nuevas funcionalidades.
*   `fix:` Para solucionar errores de código.
*   `test:` Para añadir o corregir pruebas automatizadas.
*   `refactor:` Para cambios en el código que mejoran la estructura.
*   `docs:` Para cambios exclusivos en la documentación.

## Linter y Formatter
*   **Estándar:** [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html). Con esto aseguro reglas estrictas de indentación, importaciones y obliga el uso de `camelCase` y `PascalCase`.
*   **Herramienta:** El proyecto integra el plugin **Spotless** (vía Maven).

## Pruebas Automatizadas (Testing)

*   **Frameworks:** Se utiliza **JUnit 5** para la creación de pruebas unitarias y de integración, junto con **Mockito** para simular las interacciones con la base de datos y servicios externos (como el envío de correos).
*   **Cobertura Esperada:** Toda nueva funcionalidad (features) o corrección de bugs (fixes) debe ir acompañada de sus respectivas pruebas unitarias. Se apunta a mantener una cobertura de código (Code Coverage) mínima del **70%** en la capa de Servicios (`@Service`).
*   
## Tecnologías Utilizadas

*   **Lenguaje:** Java 21
*   **Framework:** Spring Boot 
*   **Seguridad:** Spring Security & JWT (JSON Web Tokens)
*   **Encriptación:** BCryptPasswordEncoder
*   **Persistencia:** Spring Data JPA / Hibernate
*   **Base de Datos:** H2 Database (Desarrollo)
*   **Notificaciones:** JavaMailSender (Integración SMTP)

## Cacterísticas Principales

*   **Registro Seguro:** Creación de cuentas con validación exhaustiva de datos (Formato de RUT chileno, correos y políticas de contraseñas seguras).
*   **Hashing de Contraseñas:** Las credenciales nunca se almacenan utilizando algoritmos de encriptación unidireccional (Bcrypt).
*   **Autenticación Stateless:** Generación y firma de tokens JWT con tiempo de expiración para control de sesiones sin estado.
*   **Validación de Tokens:** Endpoint dedicado para que otros microservicios o aplicaciones Frontend verifiquen la validez de una sesión.
*   **Notificaciones por Correo:** Envío automático de correos electrónicos de bienvenida al completar el registro exitosamente.

## Endpoints de la API

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/registro` | Registra un nuevo usuario y envía correo de bienvenida. | No |
| `POST` | `/api/auth/login` | Autentica un usuario y devuelve un JWT firmado. | No |
| `GET` | `/api/auth/validar` | Verifica si el token enviado en el Header es válido. | Sí (Bearer Token) |
