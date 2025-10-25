import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Book } from '../types/book.type.js';
import { LitModal } from './service.modal.js';
import { alert } from './service.alert.js';

@customElement('modal-download-book')
export class ModalDownloadBook extends LitModal {
  @property({ type: Object })
  book!: Book;

  static styles = css`
    :host {
      display: contents;
    }

    dialog {
      border: none;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
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

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: #555;
    }

    select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .info-text {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 12px;
      margin-top: 8px;
      font-size: 14px;
      color: #666;
    }
  `;

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const format = formData.get('format') as string;

    try {
      if (format === 'txt') {
        const bookText = this.book.chapters
          .map((chapter) => {
            const text = chapter.parts.map((part) => part.text).join('\n');
            const chapterHeader = this.book.details?.includeChapterTitles
              ? `CHAPTER ${chapter.number}: ${chapter.title}`
              : `CHAPTER ${chapter.number}`;
            return `${chapterHeader}\n\n${text || 'Not written yet'}`;
          })
          .join('\n\n\n');

        // Download as text file
        const blob = new Blob([bookText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.book.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

      } else if (format === 'docx') {
        // Use server endpoint for DOCX generation
        const response = await fetch(`/api/book/${this.book.id}/download.docx`);
        if (!response.ok) {
          throw new Error('Failed to generate DOCX');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.book.id}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      alert.success('Book downloaded successfully');
      this.close();
    } catch (error) {
      console.error('Download failed:', error);
      alert.error('Failed to download book');
    }
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <div class="form-group">
          <label for="format">File Format</label>
          <select id="format" name="format" required>
            <option value="docx">Microsoft Word (.docx)</option>
            <option value="txt">Plain Text (.txt)</option>
          </select>
        </div>

        <div class="info-text">
          Docx files are formatted for KDP publishing with a 6 inch x 9 inch trim size.
        </div>

        <div slot="footer">
          <button type="button" @click=${() => this.close()}>Cancel</button>
          <button type="submit" class="primary">Download</button>
        </div>
      </form>
    `;
  }
}

// Helper function to open the modal
export function openDownloadBookModal(book: Book): void {
  const modal = document.createElement('modal-download-book') as ModalDownloadBook;
  modal.book = book;
  modal.title = 'Download Book';
  modal.open = true;

  modal.addEventListener('modal-closed', () => {
    document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}