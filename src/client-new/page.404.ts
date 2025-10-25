import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BasePage } from './page.interface.js';

@customElement('page-404')
export class Page404 extends BasePage {
  static styles = css`
    .error-page {
      text-align: center;
      padding: 50px 20px;
    }

    .error-code {
      font-size: 6rem;
      font-weight: bold;
      color: #dc3545;
      margin: 0;
      line-height: 1;
    }

    .error-title {
      font-size: 2rem;
      color: #333;
      margin: 20px 0;
    }

    .error-message {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 30px;
    }

    .home-link {
      display: inline-block;
      padding: 12px 24px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }

    .home-link:hover {
      background: #0056b3;
    }
  `;

  render() {
    return html`
      <div class="error-page">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Page Not Found</h2>
        <p class="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" class="home-link">Go Home</a>
      </div>
    `;
  }
}