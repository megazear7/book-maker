import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Book } from '../types/book.type.js';
import { LitModal } from './service.modal.js';
import { alert } from './service.alert.js';

@customElement('modal-book-details')
export class ModalBookDetails extends LitModal {
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
      max-width: 600px;
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

    input, textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
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
  `;

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      // Update book details
      if (!this.book.details) {
        this.book.details = {};
      }

      this.book.details.authorName = (formData.get('authorName') as string) || undefined;
      this.book.details.isbn = (formData.get('isbn') as string) || undefined;
      this.book.details.dedication = (formData.get('dedication') as string) || undefined;
      this.book.details.acknowledgements = (formData.get('acknowledgements') as string) || undefined;
      this.book.details.aboutTheAuthor = (formData.get('aboutTheAuthor') as string) || undefined;
      this.book.details.includeChapterTitles = formData.get('includeChapterTitles') === 'on';

      // Remove empty fields
      if (!this.book.details.authorName) delete this.book.details.authorName;
      if (!this.book.details.isbn) delete this.book.details.isbn;
      if (!this.book.details.dedication) delete this.book.details.dedication;
      if (!this.book.details.acknowledgements) delete this.book.details.acknowledgements;
      if (!this.book.details.aboutTheAuthor) delete this.book.details.aboutTheAuthor;

      // If details object is empty, remove it entirely
      if (this.book.details && Object.keys(this.book.details).length === 0) {
        delete this.book.details;
      }

      // Save changes
      const response = await fetch(`/api/book/${this.book.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.book),
      });

      if (!response.ok) {
        throw new Error('Failed to save book details');
      }

      alert.success('Book details saved successfully');
      this.close();

      // Reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to save details:', error);
      alert.error('Failed to save book details');
    }
  }

  render() {
    const details = this.book.details || {};

    return html`
      <form @submit=${this.handleSubmit}>
        <div class="form-group">
          <label for="authorName">Author Name</label>
          <input
            type="text"
            id="authorName"
            name="authorName"
            .value=${details.authorName || ''}
            placeholder="Enter author name"
          />
        </div>

        <div class="form-group">
          <label for="isbn">ISBN</label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            .value=${details.isbn || ''}
            placeholder="Enter ISBN"
          />
        </div>

        <div class="form-group">
          <label for="dedication">Dedication</label>
          <textarea
            id="dedication"
            name="dedication"
            placeholder="Enter dedication text"
          >${details.dedication || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="acknowledgements">Acknowledgements</label>
          <textarea
            id="acknowledgements"
            name="acknowledgements"
            placeholder="Enter acknowledgements"
          >${details.acknowledgements || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="aboutTheAuthor">About the Author</label>
          <textarea
            id="aboutTheAuthor"
            name="aboutTheAuthor"
            placeholder="Enter about the author text"
          >${details.aboutTheAuthor || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-group">
            <input
              type="checkbox"
              id="includeChapterTitles"
              name="includeChapterTitles"
              ?checked=${details.includeChapterTitles}
            />
            Include Chapter Titles
          </label>
        </div>

        <div slot="footer">
          <button type="button" @click=${() => this.close()}>Cancel</button>
          <button type="submit" class="primary">Save Details</button>
        </div>
      </form>
    `;
  }
}

// Helper function to open the modal
export function openBookDetailsModal(book: Book): void {
  const modal = document.createElement('modal-book-details') as ModalBookDetails;
  modal.book = book;
  modal.title = 'Book Details';
  modal.open = true;

  modal.addEventListener('modal-closed', () => {
    document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}