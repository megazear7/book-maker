import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Book, Chapter, ChapterPart, ChapterPartNumber } from '../types/book.type.js';
import { BasePage } from './page.interface.js';
import { CompletionBar } from './component.completion-bar.js';
import { PronunciationsComponent } from './component.pronunciation.js';
import { CharactersComponent } from './component.characters.js';
import { ReferencesComponent } from './component.references.js';
import { BookmarkTabs } from './component.bookmark-tabs.js';
import {
  aiIconLeft,
  aiIconRight,
  audioIcon,
  detailsIcon,
  downloadIcon,
  editIcon,
  gearIcon,
  plusIcon,
  refreshIcon,
  trashIcon,
} from './service.icon.js';
import { formatNumber } from './service.util.js';
import { alert } from './service.alert.js';
import { showLoading } from './service.loading.js';
import {
  addChapter,
  createChapter,
  createChapterAudio,
  createChapterOutline,
  createChapterPart,
  createChapterPartAudio,
  downloadFullAudio,
  generateEverythingApi,
  saveBook,
} from './service.api.js';
import { openBookConfigurationModal } from './modal.book-configuration.js';
import { openBookDetailsModal } from './modal.book-details.js';
import { openDownloadBookModal } from './modal.download-book.js';
import { openEditPartModal } from './modal.edit-part.js';

@customElement('page-book')
export class PageBook extends BasePage {
  @property({ type: Object })
  book!: Book;

  @property({ type: Object })
  activeChapter?: Chapter;

  @property({ type: Object })
  activePart?: ChapterPart;

  @property({ type: Number })
  activePartNumber?: ChapterPartNumber;

  @property({ type: Boolean })
  hasChanges = false;

  @state()
  private isGenerating = false;

  @state()
  private saveTimeout?: number;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .spread {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
    }

    .secondary-surface {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    .completion-section {
      margin: 20px 0;
    }

    .actions-section {
      margin: 20px 0;
    }

    .book-header {
      margin: 20px 0;
    }

    .book-title {
      font-size: 2rem;
      font-weight: bold;
      border: none;
      background: transparent;
      width: 100%;
      padding: 8px 0;
      margin-bottom: 8px;
      color: #333;
    }

    .book-title:focus {
      outline: none;
      background: rgba(0, 123, 255, 0.1);
      border-radius: 4px;
    }

    .usage-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #666;
    }

    .save-status {
      font-weight: 500;
    }

    .save-status.saving {
      color: #ffc107;
    }

    .save-status.saved {
      color: #28a745;
    }

    .textarea-wrapper {
      margin: 16px 0;
    }

    .textarea-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 8px;
    }

    .generate-instructions {
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      color: #666;
      font-size: 12px;
    }

    .generate-instructions:hover {
      background: #f0f0f0;
    }

    textarea {
      width: 100%;
      min-height: 100px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
    }

    textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .chapter-navigation {
      margin: 20px 0;
    }

    .pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .pills li {
      list-style: none;
    }

    .pills a, .pills button {
      display: inline-block;
      padding: 8px 16px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      text-decoration: none;
      color: #333;
      font-size: 14px;
      font-weight: 500;
    }

    .pills .active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .pills button {
      background: transparent;
      border: none;
      cursor: pointer;
    }

    .pills button:hover {
      background: #e9ecef;
    }

    .chapter-details {
      margin: 20px 0;
    }

    .chapter-title {
      font-size: 1.5rem;
      font-weight: bold;
      border: none;
      background: transparent;
      width: 100%;
      padding: 8px 0;
      margin-bottom: 8px;
      color: #333;
    }

    .chapter-title:focus {
      outline: none;
      background: rgba(0, 123, 255, 0.1);
      border-radius: 4px;
    }

    .part-details {
      margin: 20px 0;
    }

    .part-content {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    .part-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }

    .part-textarea {
      width: 100%;
      min-height: 200px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      line-height: 1.5;
    }

    .part-textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .part-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    button:hover {
      background: #f8f9fa;
    }

    button.secondary {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }

    button.secondary:hover {
      background: #5a6268;
    }

    button.tertiary {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }

    button.tertiary:hover {
      background: #218838;
    }

    button.warning {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }

    button.warning:hover {
      background: #c82333;
    }

    button.small {
      padding: 6px 12px;
      font-size: 12px;
    }

    h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    h2 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    }

    .button-inner {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .scroll-target {
      scroll-margin-top: 100px;
    }
  `;

  private pronunciationsComponent = new PronunciationsComponent();
  private referencesComponent = new ReferencesComponent();
  private charactersComponent = new CharactersComponent();

  connectedCallback() {
    super.connectedCallback();
    this.pronunciationsComponent.book = this.book;
    this.pronunciationsComponent.onChange = () => this.handleChange();
    this.referencesComponent.book = this.book;
    this.referencesComponent.onChange = () => this.handleChange();
    this.charactersComponent.book = this.book;
    this.charactersComponent.onChange = () => this.handleChange();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('book')) {
      this.pronunciationsComponent.book = this.book;
      this.referencesComponent.book = this.book;
      this.charactersComponent.book = this.book;
    }
  }

  private handleChange() {
    this.hasChanges = true;
    this.requestUpdate();

    // Debounce auto-save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = window.setTimeout(() => {
      this.saveChanges();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }

  private async saveChanges() {
    if (!this.hasChanges) return;

    try {
      await saveBook(this.book);
      this.hasChanges = false;
      alert.success('Book saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      alert.error('Failed to save book');
    }
  }

  private async handleDownloadBook() {
    openDownloadBookModal(this.book);
  }

  private async handleDownloadAudio() {
    try {
      await downloadFullAudio(this.book);
      alert.success('Audio download started');
    } catch (error) {
      console.error('Audio download failed:', error);
      alert.error('Failed to download audio');
    }
  }

  private handleConfigureModel() {
    openBookConfigurationModal(this.book);
  }

  private handleEditDetails() {
    openBookDetailsModal(this.book);
  }

  private async handleGenerateEverything() {
    if (this.isGenerating) return;

    try {
      this.isGenerating = true;
      const cleanup = await showLoading('Generating everything...');

      await generateEverythingApi(this.book.id, 10); // $10 max spend

      cleanup();
      this.isGenerating = false;
      alert.success('Everything generated successfully!');
      // TODO: Refresh book data
    } catch (error) {
      console.error('Generation failed:', error);
      alert.error('Failed to generate everything');
      this.isGenerating = false;
    }
  }

  private async handleDeleteBook() {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    // TODO: Implement book deletion
    alert.info('Book deletion not yet implemented');
  }

  private async handleAddChapter() {
    try {
      await addChapter(this.book);
      alert.success('Chapter added');
      // TODO: Refresh book data
    } catch (error) {
      console.error('Add chapter failed:', error);
      alert.error('Failed to add chapter');
    }
  }

  private async handleAddPart() {
    if (!this.activeChapter) return;

    try {
      // TODO: Implement adding parts
      alert.info('Add part functionality not yet implemented');
    } catch (error) {
      console.error('Add part failed:', error);
      alert.error('Failed to add part');
    }
  }

  private handleBookTitleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.book.title = target.value;
    this.handleChange();
  }

  private handleOverviewChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.book.overview = target.value;
    this.handleChange();
  }

  private handleAudioInstructionsChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.book.instructions.audio = target.value;
    this.handleChange();
  }

  private handleChapterTitleChange(e: Event) {
    if (!this.activeChapter) return;
    const target = e.target as HTMLInputElement;
    this.activeChapter.title = target.value;
    this.handleChange();
  }

  private handleChapterWhenChange(e: Event) {
    if (!this.activeChapter) return;
    const target = e.target as HTMLTextAreaElement;
    this.activeChapter.when = target.value;
    this.handleChange();
  }

  private handleChapterWhereChange(e: Event) {
    if (!this.activeChapter) return;
    const target = e.target as HTMLTextAreaElement;
    this.activeChapter.where = target.value;
    this.handleChange();
  }

  private handleChapterWhatChange(e: Event) {
    if (!this.activeChapter) return;
    const target = e.target as HTMLTextAreaElement;
    this.activeChapter.what = target.value;
    this.handleChange();
  }

  private handlePartTextChange(e: Event) {
    if (!this.activePart) return;
    const target = e.target as HTMLTextAreaElement;
    this.activePart.text = target.value;
    this.handleChange();
  }

  private navigateToChapter(chapterNumber: number) {
    window.history.pushState(null, '', `/new/book/${this.book.id}/chapter/${chapterNumber}`);
    // Trigger route parsing in the app component
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  private navigateToPart(chapterNumber: number, partNumber: number) {
    window.history.pushState(null, '', `/new/book/${this.book.id}/chapter/${chapterNumber}/part/${partNumber}`);
    // Trigger route parsing in the app component
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    const million = 1000000;
    const tokens = formatNumber(
      this.book.model.text.usage.completion_tokens +
        this.book.model.text.usage.prompt_tokens,
    );
    const cost = formatNumber(
      (this.book.model.text.usage.completion_tokens *
        (this.book.model.text.cost.outputTokenCost / million) +
        this.book.model.text.usage.prompt_tokens *
          (this.book.model.text.cost.inputTokenCost / million)),
      { decimals: 2 },
    );
    const wordCount = formatNumber(
      this.book.chapters
        .flatMap((chapter) => chapter.parts.map((part) => part.text))
        .join(' ')
        .split(/\s+/)
        .filter(word => word.length > 0).length,
    );
    const usage = `${tokens} tokens &nbsp;&nbsp;&nbsp;&nbsp; $${cost} &nbsp;&nbsp;&nbsp;&nbsp; ${wordCount} words`;

    return html`
      <div class="completion-section">
        <completion-bar .book=${this.book}></completion-bar>
      </div>

      <div class="actions-section">
        <div class="spread">
          <div>
            <button class="secondary" @click=${this.handleDownloadBook}>
              <span class="button-inner">${downloadIcon} Download Book</span>
            </button>
            <button class="secondary" @click=${this.handleDownloadAudio}>
              <span class="button-inner">${downloadIcon} Download Audio</span>
            </button>
            <button class="secondary" @click=${this.handleConfigureModel}>
              <span class="button-inner">${gearIcon} Configure</span>
            </button>
            <button class="secondary" @click=${this.handleEditDetails}>
              <span class="button-inner">${detailsIcon} Details</span>
            </button>
            <button
              class="tertiary"
              @click=${this.handleGenerateEverything}
              ?disabled=${this.isGenerating}
            >
              <span class="button-inner">
                ${aiIconLeft}
                <span>${this.isGenerating ? 'Generating...' : 'Generate everything'}</span>
                ${aiIconRight}
              </span>
            </button>
          </div>
          <div>
            <button class="warning small" @click=${this.handleDeleteBook}>
              <span class="button-inner">${trashIcon} Delete Book</span>
            </button>
          </div>
        </div>
      </div>

      <div class="book-header secondary-surface">
        <input
          class="book-title"
          .value=${this.book.title}
          @input=${this.handleBookTitleChange}
          @blur=${this.saveChanges}
        />
        <div class="usage-info">
          <span>${usage}</span>
          <span class="save-status ${this.hasChanges ? 'saving' : 'saved'}">
            ${this.hasChanges ? 'Saving...' : 'Saved'}
          </span>
        </div>
      </div>

      <div class="secondary-surface">
        <h4>Overview</h4>
        <div class="textarea-wrapper">
          <div class="textarea-actions">
            <button class="generate-instructions" @click=${() => alert.info('Generate overview not implemented')}>
              <span class="button-inner">${refreshIcon}</span>
            </button>
          </div>
          <textarea
            .value=${this.book.overview}
            @input=${this.handleOverviewChange}
            @blur=${this.saveChanges}
          ></textarea>
        </div>
      </div>

      <div class="secondary-surface">
        <h4>Audio Instructions</h4>
        <div class="textarea-wrapper">
          <div class="textarea-actions">
            <button class="generate-instructions" @click=${() => alert.info('Generate audio instructions not implemented')}>
              <span class="button-inner">${refreshIcon}</span>
            </button>
          </div>
          <textarea
            .value=${this.book.instructions.audio}
            @input=${this.handleAudioInstructionsChange}
            @blur=${this.saveChanges}
          ></textarea>
        </div>
      </div>

      ${this.pronunciationsComponent}
      ${this.referencesComponent}
      ${this.charactersComponent}

      <div class="scroll-target" data-section="chapter"></div>
      <bookmark-tabs .pageName=${'book'}></bookmark-tabs>

      <div class="chapter-navigation">
        <ul class="pills">
          ${this.book.chapters.map(chapter => html`
            <li class="${chapter.number === this.activeChapter?.number ? 'active' : ''}">
              <a
                href="/new/book/${this.book.id}/chapter/${chapter.number}"
                @click=${(e: Event) => { e.preventDefault(); this.navigateToChapter(chapter.number); }}
              >
                Chapter ${chapter.number}: ${chapter.title}
              </a>
            </li>
          `)}
          <li>
            <button @click=${this.handleAddChapter}>
              <span class="button-inner">${plusIcon} Add Chapter</span>
            </button>
          </li>
        </ul>
      </div>

      ${this.activeChapter ? html`
        <div class="part-navigation">
          <h4>Parts in Chapter ${this.activeChapter.number}</h4>
          <div class="part-pills">
            ${this.activeChapter.parts.map((part, index) => html`
              <a
                class="part-pill ${this.activePart === part ? 'active' : ''}"
                @click=${(e: Event) => { e.preventDefault(); this.navigateToPart(this.activeChapter!.number, index + 1); }}
              >
                Part ${index + 1}
              </a>
            `)}
            <button class="add-part-btn" @click=${this.handleAddPart}>+</button>
          </div>
        </div>
      ` : ''}

      ${this.activeChapter ? html`
        <div class="chapter-details secondary-surface">
          <h2>
            <input
              class="chapter-title"
              .value=${this.activeChapter.title}
              @input=${this.handleChapterTitleChange}
              @blur=${this.saveChanges}
            />
          </h2>
        </div>

        <div class="secondary-surface">
          <h4>When</h4>
          <div class="textarea-wrapper">
            <div class="textarea-actions">
              <button class="generate-instructions" @click=${() => alert.info('Generate when not implemented')}>
                <span class="button-inner">${refreshIcon}</span>
              </button>
            </div>
            <textarea
              .value=${this.activeChapter.when}
              @input=${this.handleChapterWhenChange}
              @blur=${this.saveChanges}
            ></textarea>
          </div>

          <h4>Where</h4>
          <div class="textarea-wrapper">
            <div class="textarea-actions">
              <button class="generate-instructions" @click=${() => alert.info('Generate where not implemented')}>
                <span class="button-inner">${refreshIcon}</span>
              </button>
            </div>
            <textarea
              .value=${this.activeChapter.where}
              @input=${this.handleChapterWhereChange}
              @blur=${this.saveChanges}
            ></textarea>
          </div>

          <h4>What</h4>
          <div class="textarea-wrapper">
            <div class="textarea-actions">
              <button class="generate-instructions" @click=${() => alert.info('Generate what not implemented')}>
                <span class="button-inner">${refreshIcon}</span>
              </button>
            </div>
            <textarea
              .value=${this.activeChapter.what}
              @input=${this.handleChapterWhatChange}
              @blur=${this.saveChanges}
            ></textarea>
          </div>
        </div>
      ` : ''}

      ${this.activePart ? html`
        <div class="scroll-target" data-section="part"></div>
        <div class="part-details">
          <div class="part-content">
            <div class="part-title">Part ${this.activePartNumber}</div>
            <textarea
              class="part-textarea"
              .value=${this.activePart.text}
              @input=${this.handlePartTextChange}
              @blur=${this.saveChanges}
              placeholder="Write your story here..."
            ></textarea>
            <div class="part-actions">
              <button class="secondary small" @click=${() => alert.info('Create audio not implemented')}>
                <span class="button-inner">${audioIcon} Create Audio</span>
              </button>
              <button class="secondary small" @click=${() => openEditPartModal(this.activePartNumber!, this.book, this.activeChapter!)}>
                <span class="button-inner">${editIcon} Edit</span>
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}