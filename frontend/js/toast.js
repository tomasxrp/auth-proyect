/**
 * Sistema de Notificaciones Toast Interactivas y Modernas
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
        max-width: 380px;
        width: calc(100% - 40px);
      `;
      document.body.appendChild(this.container);
    }
  }

  show({ type = 'info', title = '', message = '', duration = 4500 }) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.style.cssText = `
      pointer-events: auto;
      background: #111113;
      border: 1px solid #27272a;
      border-radius: 10px;
      padding: 12px 14px;
      color: #f4f4f5;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
      display: flex;
      gap: 10px;
      align-items: flex-start;
      position: relative;
      overflow: hidden;
      transform: translateX(120%);
      opacity: 0;
      transition: all 0.25s ease;
    `;

    // Colors and icons according to type
    let icon = 'ℹ️';
    let borderColor = '#6366f1';
    let iconBg = 'rgba(99, 102, 241, 0.15)';

    if (type === 'success') {
      icon = '✓';
      borderColor = '#10b981';
      iconBg = 'rgba(16, 185, 129, 0.2)';
    } else if (type === 'error') {
      icon = '✕';
      borderColor = '#ef4444';
      iconBg = 'rgba(239, 68, 68, 0.2)';
    } else if (type === 'warning') {
      icon = '⚠';
      borderColor = '#f59e0b';
      iconBg = 'rgba(245, 158, 11, 0.2)';
    }

    toast.style.borderLeft = `4px solid ${borderColor}`;

    toast.innerHTML = `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${iconBg};
        color: ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        flex-shrink: 0;
      ">${icon}</div>
      <div style="flex: 1; min-width: 0;">
        ${title ? `<div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 2px; color: #ffffff;">${title}</div>` : ''}
        <div style="font-size: 0.85rem; color: #94a3b8; line-height: 1.4; word-break: break-word;">${message}</div>
      </div>
      <button style="
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;
        font-size: 16px;
        padding: 0 4px;
        line-height: 1;
        transition: color 0.15s ease;
      " onmouseover="this.style.color='#f8fafc'" onmouseout="this.style.color='#64748b'">&times;</button>
      <div class="toast-progress" style="
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: ${borderColor};
        width: 100%;
        transition: width ${duration}ms linear;
      "></div>
    `;

    const closeBtn = toast.querySelector('button');
    const progressBar = toast.querySelector('.toast-progress');

    const removeToast = () => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 350);
    };

    closeBtn.onclick = removeToast;

    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
      setTimeout(() => {
        if (progressBar) progressBar.style.width = '0%';
      }, 50);
    });

    const timeoutId = setTimeout(removeToast, duration);

    toast.onmouseenter = () => {
      clearTimeout(timeoutId);
      if (progressBar) progressBar.style.transition = 'none';
    };

    toast.onmouseleave = () => {
      setTimeout(removeToast, 1500);
    };
  }

  success(message, title = 'Operación Exitosa') {
    this.show({ type: 'success', title, message });
  }

  error(message, title = 'Error') {
    this.show({ type: 'error', title, message });
  }

  warning(message, title = 'Atención') {
    this.show({ type: 'warning', title, message });
  }

  info(message, title = 'Información') {
    this.show({ type: 'info', title, message });
  }
}

window.Toast = new ToastManager();
