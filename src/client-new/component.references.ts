import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Book, ReferenceUse } from '../types/book.type.js';
import { trashIcon } from './service.icon.js';
import { createLitModal, ModalForm, ModalPartInput } from './service.modal.js';
import { getZodEnumValues } from '../shared/util.js';

@customElement('references-component')
export class ReferencesComponent extends LitElement {
  @property({ type: Object })
  book!: Book;

  @property({ type: Function })
  onChange!: () => void;

  @state()
  private isUploading = false;

  static styles = css`
    .secondary-surface {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .reference-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      padding: 8px;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }

    .reference-file {
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      padding: 6px 12px;
      flex: 1;
      text-align: left;
      font-size: 14px;
    }

    .reference-file:hover {
      background: #f8f9fa;
    }

    .remove-reference {
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      padding: 6px;
      color: #dc3545;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
    }

    .remove-reference:hover {
      background: #f8d7da;
    }

    .add-reference {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 16px;
    }

    .add-reference:hover {
      background: #218838;
    }

    .button-inner {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .file-drop {
      border: 2px dashed #ccc;
      padding: 20px;
      text-align: center;
      border-radius: 4px;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .file-drop:hover,
    .file-drop.dragover {
      border-color: #000;
    }

    .file-name {
      margin-top: 10px;
      font-size: 14px;
      color: #333;
    }

    .file-name.error {
      color: #dc3545;
    }

    .hidden {
      display: none;
    }

    .uploading {
      opacity: 0.6;
      pointer-events: none;
    }

    .uploading-indicator {
      margin-top: 10px;
      padding: 8px 12px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      color: #856404;
      font-size: 14px;
    }
  `;

  private isValidFileType(file: File): boolean {
    const allowedExtensions = ['.txt', '.docx', '.pdf'];
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some(ext => fileName.endsWith(ext));
  }

  private addReference() {
    this.book.references.push({
      file: '',
      instructions: '',
      whenToUse: [],
    });
    this.onChange();
    this.requestUpdate();
  }

  private removeReference(index: number) {
    this.book.references.splice(index, 1);
    this.onChange();
    this.requestUpdate();
  }

  private openReferenceModal(index: number) {
    const ref = this.book.references[index];

    const inputs: ModalPartInput[] = [
      {
        name: 'instructions',
        label: 'Instructions',
        type: 'textarea',
        value: ref.instructions,
      },
      {
        name: 'whenToUse',
        label: 'When to Use',
        type: 'select',
        options: getZodEnumValues(ReferenceUse).map(value => ({
          label: value.charAt(0).toUpperCase() + value.slice(1),
          value,
        })),
        value: ref.whenToUse.join(','),
      },
    ];

    const form = document.createElement('modal-form') as ModalForm;
    form.inputs = inputs;
    form.onSubmit = async (data: any) => {
      ref.instructions = data.instructions || '';
      ref.whenToUse = data.whenToUse ? data.whenToUse.split(',') as any[] : [];
      this.onChange();

      // Save to server
      await fetch(`/api/book/${this.book.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.book),
      });
    };

    // Add file upload section
    const fileSection = document.createElement('div');
    fileSection.innerHTML = `
      <div class="file-drop" id="file-drop">
        ${ref.file ? 'Drop file here or click to select to replace the file' : 'Drop file here or click to select'} (txt, docx, pdf)
      </div>
      <input type="file" id="file-input" accept=".txt,.docx,.pdf" class="hidden">
      <div class="file-name" id="file-name">${ref.file ? ref.file.split('/').pop() : 'No file selected'}</div>
    `;

    form.appendChild(fileSection);

    const modal = createLitModal('Edit Reference', form);
    document.body.appendChild(modal);
    modal.open = true;

    // Setup file handling
    this.setupFileHandling(index, modal);
  }

  private setupFileHandling(index: number, modal: any) {
    setTimeout(() => {
      const dropArea = modal.querySelector('#file-drop') as HTMLElement;
      const fileInput = modal.querySelector('#file-input') as HTMLInputElement;
      const fileNameDiv = modal.querySelector('#file-name') as HTMLElement;

      if (dropArea && fileInput) {
        dropArea.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            this.handleFile(file, index, fileNameDiv);
          }
        });

        dropArea.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropArea.classList.add('dragover');
        });

        dropArea.addEventListener('dragleave', () => {
          dropArea.classList.remove('dragover');
        });

        dropArea.addEventListener('drop', (e) => {
          e.preventDefault();
          dropArea.classList.remove('dragover');
          const file = e.dataTransfer?.files[0];
          if (file) {
            this.handleFile(file, index, fileNameDiv);
          }
        });
      }
    }, 100);
  }

  private async handleFile(file: File, index: number, fileNameDiv: HTMLElement) {
    if (!this.isValidFileType(file)) {
      fileNameDiv.textContent = 'Error: Only .txt, .docx, and .pdf files are allowed';
      fileNameDiv.classList.add('error');
      return;
    }

    fileNameDiv.classList.remove('error');
    fileNameDiv.textContent = file.name;

    const formData = new FormData();
    formData.append('file', file);

    this.isUploading = true;

    try {
      const response = await fetch(`/api/book/${this.book.id}/reference/${file.name}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        this.book.references[index].file = `books/book.${this.book.id}.references/${file.name}`;
        this.onChange();
      }
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      this.isUploading = false;
    }
  }

  render() {
    return html`
      <div class="secondary-surface">
        <h4>References</h4>
        <div id="references-list">
          ${this.book.references.map((ref, index) => html`
            <div class="reference-item">
              <button
                class="reference-file"
                @click=${() => this.openReferenceModal(index)}
              >
                <span class="button-inner">${ref.file.split('/').pop() || 'No file'}</span>
              </button>
              <button
                class="remove-reference"
                @click=${() => this.removeReference(index)}
                title="Remove reference"
              >
                <span class="button-inner">${trashIcon}</span>
              </button>
            </div>
          `)}
        </div>
        <button class="add-reference" @click=${this.addReference}>
          <span class="button-inner">Add Reference</span>
        </button>
        ${this.isUploading ? html`<div class="uploading-indicator">Uploading...</div>` : ''}
      </div>
    `;
  }
}