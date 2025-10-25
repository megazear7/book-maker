import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

// Base modal class for LitElement
@customElement('lit-modal')
export class LitModal extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: String })
  title = '';

  @query('dialog')
  private dialog!: HTMLDialogElement;

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
  `;

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        this.dialog.showModal();
      } else {
        this.dialog.close();
      }
    }
  }

  protected close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('modal-closed'));
  }

  private handleBackdropClick(e: Event) {
    if (e.target === this.dialog) {
      this.close();
    }
  }

  render() {
    return html`
      <dialog @click=${this.handleBackdropClick}>
        <div class="modal-header">
          <h2 class="modal-title">${this.title}</h2>
          <button class="close-button" @click=${this.close}>&times;</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </dialog>
    `;
  }
}

// Modal creation helper
export function createLitModal(title: string, content: any, footer?: any): LitModal {
  const modal = document.createElement('lit-modal') as LitModal;
  modal.title = title;

  if (typeof content === 'string') {
    modal.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    modal.appendChild(content);
  }

  if (footer) {
    const footerSlot = document.createElement('div');
    footerSlot.slot = 'footer';
    if (typeof footer === 'string') {
      footerSlot.innerHTML = footer;
    } else if (footer instanceof HTMLElement) {
      footerSlot.appendChild(footer);
    }
    modal.appendChild(footerSlot);
  }

  return modal;
}

// Form handling utilities
export interface ModalFormData {
  [key: string]: any;
}

export function getFormData(form: HTMLFormElement): ModalFormData {
  const data: ModalFormData = {};
  const formData = new FormData(form);

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  return data;
}

// Type definitions for modal parts (adapted for LitElement)
export interface ModalPartInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  value?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface ModalPart {
  inputs: ModalPartInput[];
  onSubmit: (data: ModalFormData) => Promise<void> | void;
}

// Modal form component
@customElement('modal-form')
export class ModalForm extends LitElement {
  @property({ type: Array })
  inputs: ModalPartInput[] = [];

  @property({ type: Function })
  onSubmit?: (data: ModalFormData) => Promise<void> | void;

  static styles = css`
    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }

    input, textarea, select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    textarea {
      min-height: 80px;
      resize: vertical;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }
  `;

  private handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = getFormData(form);

    if (this.onSubmit) {
      this.onSubmit(data);
    }
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        ${this.inputs.map(input => this.renderInput(input))}
        <div class="modal-footer">
          <button type="button" @click=${() => this.dispatchEvent(new CustomEvent('cancel'))}>Cancel</button>
          <button type="submit" class="primary">Submit</button>
        </div>
      </form>
    `;
  }

  private renderInput(input: ModalPartInput) {
    const value = input.value || '';

    switch (input.type) {
      case 'textarea':
        return html`
          <div class="form-group">
            <label for="${input.name}">${input.label}</label>
            <textarea
              id="${input.name}"
              name="${input.name}"
              placeholder="${input.placeholder || ''}"
              ?required=${input.required}
            >${value}</textarea>
          </div>
        `;

      case 'select':
        return html`
          <div class="form-group">
            <label for="${input.name}">${input.label}</label>
            <select id="${input.name}" name="${input.name}" ?required=${input.required}>
              ${input.options?.map(option => html`
                <option value="${option.value}" ?selected=${option.value === value}>
                  ${option.label}
                </option>
              `)}
            </select>
          </div>
        `;

      case 'checkbox':
        return html`
          <div class="form-group">
            <label class="checkbox-group">
              <input
                type="checkbox"
                id="${input.name}"
                name="${input.name}"
                value="true"
                ?checked=${value === 'true'}
              />
              ${input.label}
            </label>
          </div>
        `;

      default:
        return html`
          <div class="form-group">
            <label for="${input.name}">${input.label}</label>
            <input
              type="${input.type}"
              id="${input.name}"
              name="${input.name}"
              value="${value}"
              placeholder="${input.placeholder || ''}"
              ?required=${input.required}
            />
          </div>
        `;
    }
  }
}