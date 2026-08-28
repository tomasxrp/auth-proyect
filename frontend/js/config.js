/**
 * Configuración global del frontend
 */
const CONFIG = {
  DEFAULT_API_BASE_URL: 'http://localhost:9090',
  
  getApiBaseUrl() {
    return localStorage.getItem('auth_api_url') || this.DEFAULT_API_BASE_URL;
  },

  setApiBaseUrl(url) {
    if (!url) {
      localStorage.removeItem('auth_api_url');
    } else {
      // Limpiar barra final si la tiene
      const cleanUrl = url.trim().replace(/\/+$/, '');
      localStorage.setItem('auth_api_url', cleanUrl);
    }
  },

  ENDPOINTS: {
    REGISTRO: '/api/usuarios/registro',
    LOGIN: '/api/usuarios/login',
    VALIDAR: '/api/usuarios/validar'
  },

  STORAGE_KEYS: {
    TOKEN: 'auth_jwt_token',
    USER: 'auth_user_data',
    REMEMBER: 'auth_remember_me'
  }
};

window.CONFIG = CONFIG;
