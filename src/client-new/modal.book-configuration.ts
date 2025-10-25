import { LitElement, html, css, CSSResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Book } from '../types/book.type.js';
import { LitModal } from './service.modal.js';
import { alert } from './service.alert.js';

@customElement('modal-book-configuration')
export class ModalBookConfiguration extends LitModal {
  @property({ type: Object })
  book!: Book;

  @state()
  private modelOptions: { label: string; value: string }[] = [];

  @state()
  private loading = true;

  static styles = css`
    :host {
      display: contents;
    }

    dialog {
      border: none;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }

    .close-button:hover {
      background: #f0f0f0;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
    }

    button.primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    button:hover {
      opacity: 0.9;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: #555;
    }

    input, select, textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    textarea {
      min-height: 60px;
      resize: vertical;
    }

    .conditional-field {
      margin-left: 20px;
      padding-left: 16px;
      border-left: 2px solid #e0e0e0;
    }

    .hidden {
      display: none;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadModelOptions();
  }

  private async loadModelOptions() {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();

      if (data.models && data.models.length > 0) {
        this.modelOptions = data.models.map((model: string) => ({
          label: model.toUpperCase(),
          value: model,
        }));
      } else {
        this.modelOptions = [];
        alert.info(data.message || 'No model API keys configured. You can still enter a model name manually.');
      }
    } catch (error) {
      console.error('Failed to load model options:', error);
      this.modelOptions = [];
      alert.error('Failed to load model options');
    } finally {
      this.loading = false;
    }
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      // Update text model
      const textModelName = formData.get('textModelName') as string;
      const textEndpoint = formData.get('textEndpoint') as string;
      const textModelNameField = formData.get('textModelNameField') as string;
      const textDeployment = formData.get('textDeployment') as string;

      this.book.model.text.name = textModelName;
      this.book.model.text.endpoint = textEndpoint || '';
      this.book.model.text.modelName = textModelNameField || '';
      if (textDeployment) {
        this.book.model.text.deployment = textDeployment;
      } else {
        delete this.book.model.text.deployment;
      }

      // Update audio model
      const audioModelName = formData.get('audioModelName') as string;
      const audioEndpoint = formData.get('audioEndpoint') as string;
      const audioModelNameField = formData.get('audioModelNameField') as string;
      const audioDeployment = formData.get('audioDeployment') as string;

      this.book.model.audio.name = audioModelName;
      this.book.model.audio.endpoint = audioEndpoint || '';
      this.book.model.audio.modelName = audioModelNameField || '';
      if (audioDeployment) {
        this.book.model.audio.deployment = audioDeployment;
      } else {
        delete this.book.model.audio.deployment;
      }

      // Update costs
      this.book.model.text.cost.inputTokenCost = Number(formData.get('textInputTokenCost')) || 0;
      this.book.model.text.cost.inputTokenCount = Number(formData.get('textInputTokenCount')) || 0;
      this.book.model.text.cost.outputTokenCost = Number(formData.get('textOutputTokenCost')) || 0;
      this.book.model.text.cost.outputTokenCount = Number(formData.get('textOutputTokenCount')) || 0;

      this.book.model.audio.cost.inputTokenCost = Number(formData.get('audioInputTokenCost')) || 0;
      this.book.model.audio.cost.inputTokenCount = Number(formData.get('audioInputTokenCount')) || 0;
      this.book.model.audio.cost.outputTokenCost = Number(formData.get('audioOutputTokenCost')) || 0;
      this.book.model.audio.cost.outputTokenCount = Number(formData.get('audioOutputTokenCount')) || 0;

      // Save changes
      const response = await fetch(`/api/book/${this.book.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.book),
      });

      if (!response.ok) {
        throw new Error('Failed to save book configuration');
      }

      alert.success('Book configuration saved successfully');
      this.close();

      // Reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert.error('Failed to save book configuration');
    }
  }

  private handleTextModelChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.requestUpdate();
  }

  private handleAudioModelChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.requestUpdate();
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading model options...</div>`;
    }

    const textModelName = this.book.model.text.name || '';
    const audioModelName = this.book.model.audio.name || '';

    return html`
      <form @submit=${this.handleSubmit}>
        <div class="form-grid">
          <!-- Text Model Section -->
          <div class="form-section">
            <h3>Text Model Configuration</h3>

            <div class="form-group">
              <label for="textModelName">Text Model Name</label>
              ${this.modelOptions.length > 0 ? html`
                <select
                  id="textModelName"
                  name="textModelName"
                  @change=${this.handleTextModelChange}
                  required
                >
                  <option value="">Select a model...</option>
                  ${this.modelOptions.map(option => html`
                    <option
                      value="${option.value}"
                      ?selected=${option.value === textModelName}
                    >
                      ${option.label}
                    </option>
                  `)}
                </select>
              ` : html`
                <input
                  type="text"
                  id="textModelName"
                  name="textModelName"
                  .value=${textModelName}
                  placeholder="Enter model name"
                  required
                />
              `}
            </div>

            <div class="form-group">
              <label for="textEndpoint">Text Model Endpoint</label>
              <input
                type="text"
                id="textEndpoint"
                name="textEndpoint"
                .value=${this.book.model.text.endpoint || ''}
                placeholder="https://api.example.com"
              />
            </div>

            <div class="form-group">
              <label for="textModelNameField">Text Model Name Field</label>
              <input
                type="text"
                id="textModelNameField"
                name="textModelNameField"
                .value=${this.book.model.text.modelName || ''}
                placeholder="gpt-4"
              />
            </div>

            <div class="form-group conditional-field ${textModelName === 'azure' ? '' : 'hidden'}">
              <label for="textDeployment">Text Model Deployment</label>
              <input
                type="text"
                id="textDeployment"
                name="textDeployment"
                .value=${this.book.model.text.deployment || ''}
                placeholder="deployment-name"
              />
            </div>

            <h4>Text Model Costs</h4>
            <div class="form-group">
              <label for="textInputTokenCost">Input Token Cost</label>
              <input
                type="number"
                id="textInputTokenCost"
                name="textInputTokenCost"
                step="0.000001"
                .value=${String(this.book.model.text.cost.inputTokenCost || '')}
              />
            </div>

            <div class="form-group">
              <label for="textInputTokenCount">Input Token Count</label>
              <input
                type="number"
                id="textInputTokenCount"
                name="textInputTokenCount"
                .value=${String(this.book.model.text.cost.inputTokenCount || '')}
              />
            </div>

            <div class="form-group">
              <label for="textOutputTokenCost">Output Token Cost</label>
              <input
                type="number"
                id="textOutputTokenCost"
                name="textOutputTokenCost"
                step="0.000001"
                .value=${String(this.book.model.text.cost.outputTokenCost || '')}
              />
            </div>

            <div class="form-group">
              <label for="textOutputTokenCount">Output Token Count</label>
              <input
                type="number"
                id="textOutputTokenCount"
                name="textOutputTokenCount"
                .value=${String(this.book.model.text.cost.outputTokenCount || '')}
              />
            </div>
          </div>

          <!-- Audio Model Section -->
          <div class="form-section">
            <h3>Audio Model Configuration</h3>

            <div class="form-group">
              <label for="audioModelName">Audio Model Name</label>
              ${this.modelOptions.length > 0 ? html`
                <select
                  id="audioModelName"
                  name="audioModelName"
                  @change=${this.handleAudioModelChange}
                  required
                >
                  <option value="">Select a model...</option>
                  ${this.modelOptions.map(option => html`
                    <option
                      value="${option.value}"
                      ?selected=${option.value === audioModelName}
                    >
                      ${option.label}
                    </option>
                  `)}
                </select>
              ` : html`
                <input
                  type="text"
                  id="audioModelName"
                  name="audioModelName"
                  .value=${audioModelName}
                  placeholder="Enter model name"
                  required
                />
              `}
            </div>

            <div class="form-group">
              <label for="audioEndpoint">Audio Model Endpoint</label>
              <input
                type="text"
                id="audioEndpoint"
                name="audioEndpoint"
                .value=${this.book.model.audio.endpoint || ''}
                placeholder="https://api.example.com"
              />
            </div>

            <div class="form-group">
              <label for="audioModelNameField">Audio Model Name Field</label>
              <input
                type="text"
                id="audioModelNameField"
                name="audioModelNameField"
                .value=${this.book.model.audio.modelName || ''}
                placeholder="tts-1"
              />
            </div>

            <div class="form-group conditional-field ${audioModelName === 'azure' ? '' : 'hidden'}">
              <label for="audioDeployment">Audio Model Deployment</label>
              <input
                type="text"
                id="audioDeployment"
                name="audioDeployment"
                .value=${this.book.model.audio.deployment || ''}
                placeholder="deployment-name"
              />
            </div>

            <h4>Audio Model Costs</h4>
            <div class="form-group">
              <label for="audioInputTokenCost">Input Token Cost</label>
              <input
                type="number"
                id="audioInputTokenCost"
                name="audioInputTokenCost"
                step="0.000001"
                .value=${String(this.book.model.audio.cost.inputTokenCost || '')}
              />
            </div>

            <div class="form-group">
              <label for="audioInputTokenCount">Input Token Count</label>
              <input
                type="number"
                id="audioInputTokenCount"
                name="audioInputTokenCount"
                .value=${String(this.book.model.audio.cost.inputTokenCount || '')}
              />
            </div>

            <div class="form-group">
              <label for="audioOutputTokenCost">Output Token Cost</label>
              <input
                type="number"
                id="audioOutputTokenCost"
                name="audioOutputTokenCost"
                step="0.000001"
                .value=${String(this.book.model.audio.cost.outputTokenCost || '')}
              />
            </div>

            <div class="form-group">
              <label for="audioOutputTokenCount">Output Token Count</label>
              <input
                type="number"
                id="audioOutputTokenCount"
                name="audioOutputTokenCount"
                .value=${String(this.book.model.audio.cost.outputTokenCount || '')}
              />
            </div>
          </div>
        </div>

        <div slot="footer">
          <button type="button" @click=${() => this.close()}>Cancel</button>
          <button type="submit" class="primary">Save Configuration</button>
        </div>
      </form>
    `;
  }
}

// Helper function to open the modal
export function openBookConfigurationModal(book: Book): void {
  const modal = document.createElement('modal-book-configuration') as ModalBookConfiguration;
  modal.book = book;
  modal.title = 'Configure Model';
  modal.open = true;

  modal.addEventListener('modal-closed', () => {
    document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}