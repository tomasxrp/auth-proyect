/**
 * Lógica de Autenticación (Login, Registro y Redirección por Roles)
 */
document.addEventListener('DOMContentLoaded', () => {
  // Elements: Tabs & Panels
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const panelLogin = document.getElementById('panel-login');
  const panelRegister = document.getElementById('panel-register');

  // Elements: Login Form
  const formLogin = document.getElementById('form-login');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginRemember = document.getElementById('login-remember');
  const btnLoginSubmit = document.getElementById('btn-login-submit');

  // Elements: Register Form
  const formRegister = document.getElementById('form-register');
  const regEmail = document.getElementById('reg-email');
  const regPassword = document.getElementById('reg-password');
  const regConfirmPassword = document.getElementById('reg-confirm-password');
  const btnRegisterSubmit = document.getElementById('btn-register-submit');
  const roleCards = document.querySelectorAll('.role-card');

  // Elements: Password Strength
  const strengthBars = document.querySelectorAll('.strength-bar');
  const strengthLabel = document.getElementById('strength-label');

  // Elements: Backend Health & Config Modal
  const apiStatusDot = document.getElementById('api-status-dot');
  const apiStatusText = document.getElementById('api-status-text');
  const btnOpenConfig = document.getElementById('btn-open-config');
  const modalConfig = document.getElementById('modal-config');
  const btnCloseConfig = document.getElementById('btn-close-config');
  const configApiUrl = document.getElementById('config-api-url');
  const btnSaveConfig = document.getElementById('btn-save-config');
  const btnResetConfig = document.getElementById('btn-reset-config');

  // Check if user is already logged in with a valid token
  checkExistingSession();

  // ==========================================================================
  // TAB SWITCHING LOGIC
  // ==========================================================================
  function switchTab(target) {
    if (target === 'register') {
      tabLogin.classList.remove('active');
      tabRegister.classList.add('active');
      panelLogin.classList.remove('active');
      panelRegister.classList.add('active');
      regEmail.focus();
    } else {
      tabRegister.classList.remove('active');
      tabLogin.classList.add('active');
      panelRegister.classList.remove('active');
      panelLogin.classList.add('active');
      loginEmail.focus();
    }
  }

  tabLogin?.addEventListener('click', () => switchTab('login'));
  tabRegister?.addEventListener('click', () => switchTab('register'));

  // Switch link inside panel
  document.getElementById('link-to-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('register');
  });
  document.getElementById('link-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('login');
  });

  // ==========================================================================
  // ROLE SELECTOR INTERACTION
  // ==========================================================================
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  function getSelectedRole() {
    const selectedRadio = document.querySelector('input[name="user_role"]:checked');
    return selectedRadio ? selectedRadio.value : 'USER';
  }

  // ==========================================================================
  // PASSWORD VISIBILITY TOGGLE
  // ==========================================================================
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '👁️';
        btn.title = 'Ocultar contraseña';
      } else {
        input.type = 'password';
        btn.textContent = '👁️‍🗨️';
        btn.title = 'Mostrar contraseña';
      }
    });
  });

  // ==========================================================================
  // PASSWORD STRENGTH EVALUATION
  // ==========================================================================
  function evaluatePasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, text: 'Seguridad' };

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let text = 'Muy Débil';
    let level = 1;

    if (score <= 1) {
      text = 'Muy Débil (min 8 car.)';
      level = 1;
    } else if (score === 2 || score === 3) {
      text = 'Media';
      level = 2;
    } else if (score >= 4) {
      text = 'Fuerte y Segura';
      level = 3;
    }

    return { score, level, text };
  }

  regPassword?.addEventListener('input', () => {
    const val = regPassword.value;
    const { level, text } = evaluatePasswordStrength(val);

    if (strengthLabel) strengthLabel.textContent = val ? text : 'Seguridad';

    strengthBars.forEach((bar, index) => {
      bar.className = 'strength-bar';
      if (val) {
        if (index < level) {
          if (level === 1) bar.classList.add('weak');
          if (level === 2) bar.classList.add('medium');
          if (level === 3) bar.classList.add('strong');
        }
      }
    });
  });

  // ==========================================================================
  // LOGIN SUBMISSION HANDLER
  // ==========================================================================
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const contrasena = loginPassword.value;

    if (!email || !contrasena) {
      Toast.warning('Por favor completa todos los campos para iniciar sesión.', 'Campos requeridos');
      return;
    }

    // Email basic regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.error('Por favor ingresa un correo electrónico con formato válido.', 'Correo inválido');
      loginEmail.focus();
      return;
    }

    setButtonLoading(btnLoginSubmit, true, 'Verificando credenciales...');

    try {
      const response = await api.login(email, contrasena);
      const token = response.token;

      if (!token) {
        throw new Error('El servidor no retornó un token válido.');
      }

      // Decodificar el token para conocer el rol
      const claims = api.decodeJwt(token);
      const rol = claims?.rol || 'USER';
      const userEmail = claims?.sub || email;

      // Guardar token y datos de sesión
      const storage = loginRemember?.checked ? localStorage : sessionStorage;
      storage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
      storage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify({ email: userEmail, rol }));

      Toast.success(`¡Bienvenido de nuevo, ${userEmail}! Redirigiendo a tu panel...`, 'Acceso Autorizado');

      // Redirección condicionada por Rol
      setTimeout(() => {
        redirectToDashboard(rol);
      }, 1200);

    } catch (err) {
      setButtonLoading(btnLoginSubmit, false, 'Iniciar Sesión');
      Toast.error(err.message || 'Error al iniciar sesión', 'Acceso Denegado');
    }
  });

  // ==========================================================================
  // REGISTER SUBMISSION HANDLER
  // ==========================================================================
  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = regEmail.value.trim();
    const contrasena = regPassword.value;
    const confirmPassword = regConfirmPassword.value;
    const rol = getSelectedRole();

    // Validations
    if (!email || !contrasena || !confirmPassword) {
      Toast.warning('Por favor completa todos los campos del registro.', 'Campos requeridos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.error('El formato del correo electrónico no es válido.', 'Correo inválido');
      regEmail.focus();
      return;
    }

    if (contrasena.length < 8) {
      Toast.error('La contraseña debe tener al menos 8 caracteres según las reglas del backend.', 'Contraseña muy corta');
      regPassword.focus();
      return;
    }

    if (contrasena !== confirmPassword) {
      Toast.error('Las contraseñas ingresadas no coinciden.', 'Error de coincidencia');
      regConfirmPassword.focus();
      return;
    }

    setButtonLoading(btnRegisterSubmit, true, 'Creando cuenta en el servidor...');

    try {
      const response = await api.register(email, contrasena, rol);

      Toast.success(
        `Usuario registrado exitosamente con el rol [${rol}]. Se ha enviado un correo de bienvenida.`,
        '¡Registro Completado!'
      );

      // Limpiar formulario y cambiar a pestaña de login con email precargado
      formRegister.reset();
      loginEmail.value = email;
      loginPassword.value = '';
      
      setButtonLoading(btnRegisterSubmit, false, 'Crear Cuenta');

      setTimeout(() => {
        switchTab('login');
        Toast.info('Ingresa tu contraseña para acceder.', 'Inicia Sesión');
      }, 1500);

    } catch (err) {
      setButtonLoading(btnRegisterSubmit, false, 'Crear Cuenta');
      Toast.error(err.message || 'Error al registrar usuario.', 'Error de Registro');
    }
  });

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================
  function setButtonLoading(button, isLoading, text) {
    if (!button) return;
    button.disabled = isLoading;
    if (isLoading) {
      button.innerHTML = `<span class="btn-spinner"></span> <span>${text}</span>`;
    } else {
      button.innerHTML = `<span>${text}</span> <span style="font-size: 1.1rem;">→</span>`;
    }
  }

  function redirectToDashboard(rol) {
    const roleNormalized = (rol || '').toUpperCase();
    if (roleNormalized.includes('ADMIN')) {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'user-dashboard.html';
    }
  }

  function checkExistingSession() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN) || sessionStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    if (token && !api.isTokenExpired(token)) {
      const claims = api.decodeJwt(token);
      if (claims?.rol) {
        console.log('Sesión activa detectada para el rol:', claims.rol);
        // Descomentar si se desea redirección automática si ya está logeado:
        // redirectToDashboard(claims.rol);
      }
    }
  }

  // ==========================================================================
  // BACKEND HEALTH CHECK & CONFIG MODAL
  // ==========================================================================
  async function pingBackend() {
    if (!apiStatusDot || !apiStatusText) return;
    const isOnline = await api.checkBackendHealth();
    if (isOnline) {
      apiStatusDot.style.background = '#10b981';
      apiStatusText.textContent = `Backend Conectado (${CONFIG.getApiBaseUrl()})`;
    } else {
      apiStatusDot.style.background = '#ef4444';
      apiStatusText.textContent = `Backend Desconectado (${CONFIG.getApiBaseUrl()})`;
    }
  }

  pingBackend();

  btnOpenConfig?.addEventListener('click', () => {
    if (configApiUrl) configApiUrl.value = CONFIG.getApiBaseUrl();
    if (modalConfig) modalConfig.classList.remove('hidden');
  });

  btnCloseConfig?.addEventListener('click', () => {
    if (modalConfig) modalConfig.classList.add('hidden');
  });

  btnSaveConfig?.addEventListener('click', () => {
    if (configApiUrl && configApiUrl.value) {
      CONFIG.setApiBaseUrl(configApiUrl.value);
      Toast.success(`URL del backend actualizada a: ${CONFIG.getApiBaseUrl()}`, 'Configuración Guardada');
      modalConfig.classList.add('hidden');
      pingBackend();
    }
  });

  btnResetConfig?.addEventListener('click', () => {
    CONFIG.setApiBaseUrl(CONFIG.DEFAULT_API_BASE_URL);
    if (configApiUrl) configApiUrl.value = CONFIG.DEFAULT_API_BASE_URL;
    Toast.info(`URL restablecida a por defecto: ${CONFIG.DEFAULT_API_BASE_URL}`, 'Configuración Restablecida');
    modalConfig.classList.add('hidden');
    pingBackend();
  });
});
