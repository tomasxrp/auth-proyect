/**
 * Lógica para Paneles de Control (Admin & User) y Protección de Rutas (Auth Guard)
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const userEmailDisplays = document.querySelectorAll('.user-email-text');
  const userRoleDisplays = document.querySelectorAll('.user-role-text');
  const userAvatarInitial = document.getElementById('user-avatar-initial');
  const sessionExpiresText = document.getElementById('session-expires-text');
  const sessionProgressFill = document.getElementById('session-progress-fill');
  const btnLogout = document.getElementById('btn-logout');

  // Token Inspector Elements
  const rawJwtToken = document.getElementById('raw-jwt-token');
  const btnCopyToken = document.getElementById('btn-copy-token');
  const jwtClaimSub = document.getElementById('jwt-claim-sub');
  const jwtClaimRol = document.getElementById('jwt-claim-rol');
  const jwtClaimIat = document.getElementById('jwt-claim-iat');
  const jwtClaimExp = document.getElementById('jwt-claim-exp');

  // API Tester Elements
  const btnTestValidate = document.getElementById('btn-test-validate');
  const apiTestResponse = document.getElementById('api-test-response');
  const apiTestStatus = document.getElementById('api-test-status');
  const apiTestTime = document.getElementById('api-test-time');

  // 1. AUTH GUARD: Verificar presencia del Token
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN) || sessionStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);

  if (!token) {
    console.warn('No se encontró sesión activa. Redirigiendo al login...');
    window.location.href = 'index.html';
    return;
  }

  // 2. Verificar expiración
  if (api.isTokenExpired(token)) {
    Toast.warning('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'Sesión Expirada');
    clearSession();
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
    return;
  }

  // 3. Decodificar JWT y verificar rol
  const claims = api.decodeJwt(token);
  if (!claims) {
    Toast.error('Token con formato no reconocido. Redirigiendo al login.', 'Error de Sesión');
    clearSession();
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
    return;
  }

  const userEmail = claims.sub || 'usuario@example.com';
  const userRole = claims.rol || 'USER';
  const isCurrentPageAdmin = window.location.pathname.includes('admin-dashboard.html');

  // Si un usuario común intenta acceder a admin-dashboard.html directamente:
  if (isCurrentPageAdmin && !userRole.toUpperCase().includes('ADMIN')) {
    Toast.warning('No tienes permisos de Administrador para acceder a esta vista.', 'Acceso Restringido');
    setTimeout(() => {
      window.location.href = 'user-dashboard.html';
    }, 1500);
    return;
  }

  // 4. Actualizar información de usuario en el UI
  userEmailDisplays.forEach(el => { el.textContent = userEmail; });
  userRoleDisplays.forEach(el => { el.textContent = userRole; });

  if (userAvatarInitial) {
    userAvatarInitial.textContent = (userEmail[0] || 'U').toUpperCase();
  }

  // 5. Poblar el Inspector de JWT
  if (rawJwtToken) {
    rawJwtToken.textContent = token;
  }

  if (jwtClaimSub) jwtClaimSub.textContent = userEmail;
  if (jwtClaimRol) jwtClaimRol.textContent = userRole;

  if (jwtClaimIat && claims.iat) {
    const iatDate = new Date(claims.iat * 1000);
    jwtClaimIat.textContent = iatDate.toLocaleTimeString() + ' (' + iatDate.toLocaleDateString() + ')';
  }

  if (jwtClaimExp && claims.exp) {
    const expDate = new Date(claims.exp * 1000);
    jwtClaimExp.textContent = expDate.toLocaleTimeString() + ' (' + expDate.toLocaleDateString() + ')';
  }

  // 6. Iniciar Temporizador de Expiración de Sesión
  let totalTokenDuration = 86400; // default 24h
  if (claims.exp && claims.iat) {
    totalTokenDuration = claims.exp - claims.iat;
  }

  function updateSessionTimer() {
    const remaining = api.getTokenRemainingSeconds(token);

    if (remaining <= 0) {
      if (sessionExpiresText) sessionExpiresText.textContent = 'Expirado';
      if (sessionProgressFill) sessionProgressFill.style.width = '0%';
      Toast.warning('Tu sesión ha finalizado.', 'Sesión Expirada');
      clearSession();
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      return;
    }

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    let timeString = '';
    if (hours > 0) timeString += `${hours}h `;
    timeString += `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

    if (sessionExpiresText) sessionExpiresText.textContent = timeString;

    const percentage = Math.max(0, Math.min(100, (remaining / totalTokenDuration) * 100));
    if (sessionProgressFill) sessionProgressFill.style.width = `${percentage}%`;
  }

  updateSessionTimer();
  setInterval(updateSessionTimer, 1000);

  // 7. Botón Copiar Token
  btnCopyToken?.addEventListener('click', () => {
    navigator.clipboard.writeText(token).then(() => {
      Toast.success('Token JWT copiado al portapapeles.', 'Copiado');
    }).catch(() => {
      Toast.info('Selecciona y copia el token manualmente.', 'Aviso');
    });
  });

  // 8. Botón Cerrar Sesión
  btnLogout?.addEventListener('click', (e) => {
    e.preventDefault();
    clearSession();
    Toast.info('Sesión cerrada con éxito.', 'Hasta pronto');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  });

  function clearSession() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
  }

  // 9. Probador Interactivo del Endpoint /api/usuarios/validar
  async function testValidateEndpoint() {
    if (!apiTestResponse) return;

    if (btnTestValidate) {
      btnTestValidate.disabled = true;
      btnTestValidate.innerHTML = '<span class="btn-spinner"></span> Validando en backend...';
    }

    const startTime = performance.now();

    try {
      const result = await api.validateToken(token);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      if (apiTestStatus) {
        apiTestStatus.textContent = '200 OK';
        apiTestStatus.className = 'status-tag ok';
      }

      if (apiTestTime) {
        apiTestTime.textContent = `${duration} ms`;
      }

      apiTestResponse.textContent = JSON.stringify(result, null, 2);
      Toast.success('Token verificado correctamente en el backend Spring Boot.', 'Validación Exitosa');

    } catch (err) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      if (apiTestStatus) {
        apiTestStatus.textContent = 'Error';
        apiTestStatus.className = 'status-tag err';
      }

      if (apiTestTime) {
        apiTestTime.textContent = `${duration} ms`;
      }

      apiTestResponse.textContent = JSON.stringify({ error: err.message }, null, 2);
      Toast.error(err.message, 'Error de Validación');
    } finally {
      if (btnTestValidate) {
        btnTestValidate.disabled = false;
        btnTestValidate.innerHTML = '⚡ Probar /api/usuarios/validar';
      }
    }
  }

  btnTestValidate?.addEventListener('click', testValidateEndpoint);

  // Ejecutar validación automática inicial silenciosa para corroborar contra el backend
  testValidateEndpoint();
});
