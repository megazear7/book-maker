import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('alert-toast')
export class AlertToast extends LitElement {
  @property({ type: String })
  message = '';

  @property({ type: String })
  type: 'info' | 'success' | 'warning' | 'error' = 'info';

  @property({ type: Boolean })
  visible = false;

  static styles = css`
    :host {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1001;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      max-width: 400px;
    }

    :host([visible]) {
      opacity: 1;
      transform: translateY(0);
    }

    .toast {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 16px;
      border-left: 4px solid;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast.info {
      border-left-color: #007bff;
    }

    .toast.success {
      border-left-color: #28a745;
    }

    .toast.warning {
      border-left-color: #ffc107;
    }

    .toast.error {
      border-left-color: #dc3545;
    }

    .icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
    }

    .close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.7;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close:hover {
      opacity: 1;
    }
  `;

  private timeoutId?: number;

  connectedCallback() {
    super.connectedCallback();
    if (this.visible) {
      this.scheduleHide();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('visible') && this.visible) {
      this.scheduleHide();
    }
  }

  private scheduleHide() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = window.setTimeout(() => {
      this.visible = false;
    }, 5000);
  }

  private close() {
    this.visible = false;
  }

  render() {
    const icon = this.getIcon();
    return html`
      <div class="toast ${this.type}">
        <span class="icon">${icon}</span>
        <div class="content">${this.message}</div>
        <button class="close" @click=${this.close}>&times;</button>
      </div>
    `;
  }

  private getIcon() {
    switch (this.type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  }
}

// Alert management
export function showAlert(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  const toast = document.createElement('alert-toast') as AlertToast;
  toast.message = message;
  toast.type = type;
  toast.visible = true;

  document.body.appendChild(toast);

  // Remove after animation
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 5300);
}

export const alert = {
  info: (message: string) => showAlert(message, 'info'),
  success: (message: string) => showAlert(message, 'success'),
  warning: (message: string) => showAlert(message, 'warning'),
  error: (message: string) => showAlert(message, 'error'),
};