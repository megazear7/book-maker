import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('loading-overlay')
export class LoadingOverlay extends LitElement {
  @property({ type: String })
  message = 'Loading...';

  @property({ type: Boolean })
  visible = false;

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }

    :host([visible]) {
      opacity: 1;
      pointer-events: auto;
    }

    .loading-content {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .message {
      color: #666;
      font-size: 14px;
    }
  `;

  render() {
    return html`
      <div class="loading-content">
        <div class="spinner"></div>
        <div class="message">${this.message}</div>
      </div>
    `;
  }
}

// Loading management
let loadingOverlay: LoadingOverlay | null = null;

export async function showLoading(message: string = 'Loading...'): Promise<() => void> {
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('loading-overlay') as LoadingOverlay;
    document.body.appendChild(loadingOverlay);
  }

  loadingOverlay.message = message;
  loadingOverlay.visible = true;

  return () => {
    if (loadingOverlay) {
      loadingOverlay.visible = false;
    }
  };
}

export function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.visible = false;
  }
}