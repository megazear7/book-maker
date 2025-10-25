import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Book, Chapter } from '../types/book.type.js';
import { LitModal } from './service.modal.js';
import { alert } from './service.alert.js';
import { editChapterPart } from './service.api.js';

@customElement('modal-edit-part')
export class ModalEditPart extends LitModal {
  @property({ type: Number })
  partNumber!: number;

  @property({ type: Object })
  book!: Book;

  @property({ type: Object })
  chapter!: Chapter;

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

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    textarea {
      width: 100%;
      min-height: 80px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
      resize: vertical;
    }

    textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
  `;

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      // Prepare the edit options
      const options = {
        addMoreDialog: formData.get('addMoreDialog') === 'on',
        useLessDescriptiveLanguage: formData.get('useLessDescriptiveLanguage') === 'on',
        replaceUndesirableWords: formData.get('replaceUndesirableWords') === 'on',
        splitIntoParagraphs: formData.get('splitIntoParagraphs') === 'on',
        removeOutOfPlaceReferences: formData.get('removeOutOfPlaceReferences') === 'on',
        additionalInstructions: (formData.get('additionalInstructions') as string) || '',
      };

      // Use the API service function
      await editChapterPart(this.book, this.chapter, this.partNumber, options);

      alert.success('Chapter part edited successfully');
      this.close();

      // Reload the page to show the edited content
      window.location.reload();
    } catch (error) {
      console.error('Failed to edit chapter part:', error);
      alert.error('Failed to edit chapter part. Please try again.');
    }
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit}>
        <div class="form-group">
          <label class="checkbox-group">
            <input type="checkbox" id="addMoreDialog" name="addMoreDialog" />
            Add more dialog
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-group">
            <input type="checkbox" id="useLessDescriptiveLanguage" name="useLessDescriptiveLanguage" />
            Use less descriptive language
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-group">
            <input type="checkbox" id="replaceUndesirableWords" name="replaceUndesirableWords" />
            Replace undesirable words
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-group">
            <input type="checkbox" id="splitIntoParagraphs" name="splitIntoParagraphs" />
            Split into paragraphs
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-group">
            <input type="checkbox" id="removeOutOfPlaceReferences" name="removeOutOfPlaceReferences" />
            Remove out-of-place references
          </label>
        </div>

        <div class="form-group">
          <label for="additionalInstructions">Additional Instructions</label>
          <textarea
            id="additionalInstructions"
            name="additionalInstructions"
            placeholder="Enter any additional editing instructions..."
          ></textarea>
        </div>

        <div slot="footer">
          <button type="button" @click=${() => this.close()}>Cancel</button>
          <button type="submit" class="primary">Edit</button>
        </div>
      </form>
    `;
  }
}

// Helper function to open the modal
export function openEditPartModal(partNumber: number, book: Book, chapter: Chapter): void {
  const modal = document.createElement('modal-edit-part') as ModalEditPart;
  modal.partNumber = partNumber;
  modal.book = book;
  modal.chapter = chapter;
  modal.title = 'Edit Chapter Part';
  modal.open = true;

  modal.addEventListener('modal-closed', () => {
    document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}