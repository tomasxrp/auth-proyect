/**
 * Cliente API para interactuar con el backend de Spring Boot
 */
const api = {
  /**
   * Obtiene la URL completa para un endpoint
   */
  getUrl(endpoint) {
    const base = window.CONFIG ? window.CONFIG.getApiBaseUrl() : 'http://localhost:9090';
    return `${base}${endpoint}`;
  },

  /**
   * Inicia sesión contra el backend
   * @param {string} email
   * @param {string} contrasena
   * @returns {Promise<{token: string}>}
   */
  async login(email, contrasena) {
    try {
      const response = await fetch(this.getUrl(CONFIG.ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, contrasena })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.error || data.Error || data.message || `Error de autenticación (${response.status})`;
        throw new Error(errorMsg);
      }

      return data; // { token: "..." }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor backend en ' + CONFIG.getApiBaseUrl() + '. Verifica que esté encendido.');
      }
      throw err;
    }
  },

  /**
   * Registra un nuevo usuario en el backend
   * @param {string} email
   * @param {string} contrasena
   * @param {string} rol
   * @returns {Promise<{email: string, rol: string, mensaje: string}>}
   */
  async register(email, contrasena, rol) {
    try {
      const response = await fetch(this.getUrl(CONFIG.ENDPOINTS.REGISTRO), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, contrasena, rol })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = data.error || data.Error || data.message;
        
        // Si hay errores de validación de Spring Boot (MethodArgumentNotValidException)
        if (!errorMsg && response.status === 400) {
          errorMsg = 'Los datos ingresados no cumplen con los requisitos de validación.';
        } else if (!errorMsg) {
          errorMsg = `Error al registrar usuario (${response.status})`;
        }
        
        throw new Error(errorMsg);
      }

      return data; // { email, rol, mensaje }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor backend en ' + CONFIG.getApiBaseUrl() + '. Verifica que esté encendido.');
      }
      throw err;
    }
  },

  /**
   * Valida un token JWT contra el endpoint protegido /api/usuarios/validar
   * @param {string} token
   * @returns {Promise<{valido: boolean, email: string, autoridades: Array}>}
   */
  async validateToken(token) {
    try {
      const response = await fetch(this.getUrl(CONFIG.ENDPOINTS.VALIDAR), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Token inválido o sesión expirada (${response.status})`);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  },

  /**
   * Decodifica un JWT localmente para inspeccionar sus claims
   * @param {string} token
   * @returns {object|null}
   */
  decodeJwt(token) {
    try {
      if (!token || typeof token !== 'string') return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(payloadBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error al decodificar JWT:', e);
      return null;
    }
  },

  /**
   * Comprueba si el token JWT ya ha expirado
   * @param {string} token
   * @returns {boolean}
   */
  isTokenExpired(token) {
    const claims = this.decodeJwt(token);
    if (!claims || !claims.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return claims.exp < now;
  },

  /**
   * Obtiene la cantidad de segundos restantes de validez del token
   * @param {string} token
   * @returns {number}
   */
  getTokenRemainingSeconds(token) {
    const claims = this.decodeJwt(token);
    if (!claims || !claims.exp) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, claims.exp - now);
  },

  /**
   * Verifica la conectividad con el backend
   * @returns {Promise<boolean>}
   */
  async checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(this.getUrl(CONFIG.ENDPOINTS.LOGIN), {
        method: 'OPTIONS',
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      return res !== null;
    } catch {
      return false;
    }
  }
};

window.api = api;
