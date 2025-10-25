import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BasePage } from './page.interface.js';

@customElement('page-home')
export class PageHome extends BasePage {
  static styles = css`
    .home-page {
      text-align: center;
      padding: 50px 20px;
    }

    .welcome-title {
      font-size: 2.5rem;
      color: #333;
      margin: 0 0 20px 0;
      font-weight: 300;
    }

    .welcome-message {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 40px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }

    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }

    .cta-button:hover {
      background: #0056b3;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      margin-top: 60px;
      max-width: 1000px;
      margin-left: auto;
      margin-right: auto;
    }

    .feature {
      padding: 30px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: left;
    }

    .feature-icon {
      font-size: 2rem;
      margin-bottom: 15px;
      display: block;
    }

    .feature-title {
      font-size: 1.3rem;
      color: #333;
      margin: 0 0 10px 0;
      font-weight: 600;
    }

    .feature-description {
      color: #666;
      line-height: 1.5;
      margin: 0;
    }
  `;

  render() {
    return html`
      <div class="home-page">
        <h1 class="welcome-title">Welcome to Book Maker</h1>
        <p class="welcome-message">
          Create, manage, and publish your books with our comprehensive writing platform.
          From initial outlines to final audio production, we have you covered.
        </p>
        <a href="/book/new" class="cta-button">Start Writing</a>

        <div class="features">
          <div class="feature">
            <span class="feature-icon">📝</span>
            <h3 class="feature-title">Structured Writing</h3>
            <p class="feature-description">
              Organize your books with chapters and parts. Keep track of your progress with our completion indicators.
            </p>
          </div>
          <div class="feature">
            <span class="feature-icon">🎵</span>
            <h3 class="feature-title">Audio Production</h3>
            <p class="feature-description">
              Generate high-quality audio versions of your books with customizable pronunciations and voice settings.
            </p>
          </div>
          <div class="feature">
            <span class="feature-icon">📚</span>
            <h3 class="feature-title">Reference Management</h3>
            <p class="feature-description">
              Upload and manage reference materials to enhance your writing process and maintain consistency.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}