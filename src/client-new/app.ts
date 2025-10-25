import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('hello-world')
class HelloWorld extends LitElement {
  static styles = css`
    :host {
      display: block;
      text-align: center;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    h1 {
      color: #007bff;
      margin-bottom: 20px;
    }

    p {
      color: #666;
      font-size: 18px;
    }
  `;

  render() {
    return html`
      <h1>Hello World from Lit! 7</h1>
      <p>Welcome to the new LitElement application.</p>
    `;
  }
}