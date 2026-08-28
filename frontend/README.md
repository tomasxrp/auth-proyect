# Frontend de Autenticación & Autorización (AuthProyect)

Este módulo web proporciona una interfaz moderna, responsiva y de alta calidad estética (Glassmorphism, tema oscuro refinado, micro-animaciones y notificaciones interactivas) para interactuar con los servicios REST del backend Spring Boot.

---

## 🚀 Estructura del Frontend

```
frontend/
├── index.html              # Portal de acceso con formularios de Login y Registro
├── admin-dashboard.html    # Panel de control exclusivo para ADMINISTRADOR
├── user-dashboard.html     # Panel de usuario estándar para rol USER
├── css/
│   ├── main.css            # Tokens de diseño, variables HSL, fuentes, animaciones y glassmorphism
│   ├── auth.css            # Estilos para formularios de login/registro, tabs y fortaleza de contraseña
│   └── dashboard.css       # Estilos para dashboards, inspector JWT, temporizador y probadores API
├── js/
│   ├── config.js           # Configuración base de la API (URL default: http://localhost:9090)
│   ├── toast.js            # Sistema moderno de notificaciones flotantes (Toast)
│   ├── api.js              # Cliente HTTP para login, registro, validación de JWT y decodificador
│   ├── auth.js             # Lógica de formularios, validaciones, selector de rol y redirección
│   └── dashboard.js        # Auth guard, comprobación de sesión, inspector JWT y probador en vivo
└── README.md
```

---

## 🔑 Flujo de Autenticación y Redirección por Rol

1. **Registro (`POST /api/usuarios/registro`)**:
   - Envía `{ email, contrasena, rol }`.
   - Valida formato de correo, longitud de contraseña (mínimo 8 caracteres) y selección de rol (`USER` o `ADMINISTRADOR`).
   - Al registrar con éxito, notifica al usuario y transiciona al formulario de inicio de sesión con el email pre-completado.

2. **Login (`POST /api/usuarios/login`)**:
   - Envía `{ email, contrasena }`.
   - El backend responde con `{ "token": "<JWT>" }`.
   - El cliente decodifica el token localmente para extraer el claim `"rol"` y el subject `"sub"`.
   - Almacena el token de forma segura (`localStorage` o `sessionStorage`).
   - **Redirección automática**:
     - Si el rol contiene `ADMIN` o `ADMINISTRADOR` $\rightarrow$ Redirige a `admin-dashboard.html`.
     - Si el rol es `USER` u otro $\rightarrow$ Redirige a `user-dashboard.html`.

3. **Protección de Rutas (Auth Guard)**:
   - Los dashboards comprueban automáticamente la presencia y vigencia del token JWT.
   - Si no hay token o ha expirado, redirigen automáticamente a `index.html`.
   - Los dashboards consultan el endpoint protegido `GET /api/usuarios/validar` enviando `Authorization: Bearer <token>` para validar la sesión en Spring Security.

---

## 🛠️ Cómo Ejecutar el Frontend

Puedes abrir los archivos directamente o mediante cualquier servidor web estático:

### Opción 1: Live Server / VS Code
Haz clic derecho en `frontend/index.html` y selecciona **Open with Live Server**.

### Opción 2: Python HTTP Server
```bash
cd frontend
python -m http.server 3000
```
Luego ingresa en tu navegador a: [http://localhost:3000](http://localhost:3000)

### Opción 3: Abrir archivo directamente en el navegador
Puedes hacer doble clic en `frontend/index.html` para abrirlo directamente en Google Chrome, Edge, Firefox, etc.

---

## ⚙️ Configuración del Backend

- La URL base por defecto del backend es `http://localhost:9090`.
- Si tu backend corre en otro puerto o dominio, puedes hacer clic en el botón **⚙️ Ajustes** en la parte inferior de la página de Login para modificarla sin tocar el código fuente.
