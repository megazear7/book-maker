import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  Book,
  BookId,
  BookMinimalInfo,
  Chapter,
  ChapterPart,
  ChapterPartNumber,
} from '../types/book.type.js';
import { PageName } from '../types/app.type.js';
import './page.home.js';
import './page.book.js';
import './page.404.js';

@customElement('book-maker-app')
export class BookMakerApp extends LitElement {
  @state()
  private books: BookMinimalInfo[] = [];

  @state()
  private currentPage: PageName = 'home';

  @state()
  private bookId?: BookId;

  @state()
  private book?: Book;

  @state()
  private chapter?: Chapter;

  @state()
  private activePart?: ChapterPart;

  @state()
  private hasChanges: boolean = false;

  @state()
  private partNumber?: ChapterPartNumber;

  @state()
  private isLoading = false;

  @state()
  private error?: string;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .pills {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
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

    .loading-state, .error-state {
      text-align: center;
      padding: 50px 20px;
    }

    .error-state h2 {
      color: #dc3545;
      margin-bottom: 16px;
    }

    .error-state button {
      padding: 8px 16px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .error-state button:hover {
      background: #c82333;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadBooks();
    this.parseRoute();
    window.addEventListener('popstate', () => this.parseRoute());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', () => this.parseRoute());
  }

  private async loadBooks() {
    try {
      const response = await fetch('/api/books');
      this.books = BookMinimalInfo.array().parse(await response.json());
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  }

  private parseRoute() {
    const path = window.location.pathname;

    if (path === '/') {
      this.currentPage = 'home';
      this.bookId = undefined;
      this.book = undefined;
      this.chapter = undefined;
      this.activePart = undefined;
      this.partNumber = undefined;
    } else if (path.match(/^\/book\/([^/]+)\/chapter\/([^/]+)\/part\/([^/]+)$/)) {
      const [, bookId, chapterNum, partNum] = path.match(/^\/book\/([^/]+)\/chapter\/([^/]+)\/part\/([^/]+)$/)!;
      this.currentPage = 'part';
      this.bookId = bookId as BookId;
      this.partNumber = parseInt(partNum) as ChapterPartNumber;
      this.loadBookData();
    } else if (path.match(/^\/book\/([^/]+)\/chapter\/([^/]+)$/)) {
      const [, bookId, chapterNum] = path.match(/^\/book\/([^/]+)\/chapter\/([^/]+)$/)!;
      this.currentPage = 'chapter';
      this.bookId = bookId as BookId;
      this.loadBookData();
    } else if (path.match(/^\/book\/([^/]+)$/)) {
      const [, bookId] = path.match(/^\/book\/([^/]+)$/)!;
      this.currentPage = 'book';
      this.bookId = bookId as BookId;
      this.loadBookData();
    } else {
      this.currentPage = '404';
    }
  }

  private async loadBookData() {
    if (!this.bookId) return;

    this.isLoading = true;
    this.error = undefined;

    try {
      const response = await fetch(`/api/book/${this.bookId}`);
      if (!response.ok) {
        throw new Error(`Failed to load book: ${response.statusText}`);
      }
      this.book = Book.parse(await response.json());

      // Find active chapter and part based on current page
      if (this.currentPage === 'chapter' && this.book) {
        const chapterNum = parseInt(window.location.pathname.split('/')[4]);
        this.chapter = this.book.chapters.find(c => c.number === chapterNum);
      } else if (this.currentPage === 'part' && this.book) {
        const chapterNum = parseInt(window.location.pathname.split('/')[4]);
        const partNum = parseInt(window.location.pathname.split('/')[6]);
        this.chapter = this.book.chapters.find(c => c.number === chapterNum);
        if (this.chapter) {
          this.activePart = this.chapter.parts[partNum - 1];
        }
      }
    } catch (error) {
      console.error('Failed to load book data:', error);
      this.error = error instanceof Error ? error.message : 'Failed to load book data';
    } finally {
      this.isLoading = false;
    }
  }

  private navigateTo(path: string) {
    window.history.pushState(null, '', path);
    this.parseRoute();
  }

  private handleNewBook() {
    // TODO: Implement new book creation
    console.log('New book clicked');
  }

  render() {
    return html`
      <div class="pills">
        <li class="${this.currentPage === 'home' ? 'active' : ''}">
          <a href="/" @click=${(e: Event) => { e.preventDefault(); this.navigateTo('/'); }}>Home</a>
        </li>
        ${this.books.map(book => html`
          <li class="${book.id === this.book?.id ? 'active' : ''}">
            <a href="/book/${book.id}" @click=${(e: Event) => { e.preventDefault(); this.navigateTo(`/book/${book.id}`); }}>${book.title}</a>
          </li>
        `)}
        <li>
          <button @click=${this.handleNewBook}>+ New Book</button>
        </li>
      </div>

      <div class="container">
        ${this.renderPage()}
      </div>
    `;
  }

  private renderPage() {
    // Show error state if there's an error
    if (this.error) {
      return html`
        <div class="error-state">
          <h2>Error</h2>
          <p>${this.error}</p>
          <button @click=${() => this.loadBookData()}>Retry</button>
        </div>
      `;
    }

    // Show loading state
    if (this.isLoading) {
      return html`
        <div class="loading-state">
          <p>Loading...</p>
        </div>
      `;
    }

    switch (this.currentPage) {
      case 'home':
        return html`<page-home></page-home>`;
      case 'book':
        return this.book ? html`<page-book .book=${this.book} .activeChapter=${this.chapter} .activePart=${this.activePart} .activePartNumber=${this.partNumber} .hasChanges=${this.hasChanges}></page-book>` : html`<p>Loading...</p>`;
      case 'chapter':
        return this.book && this.chapter ? html`<chapter-page .book=${this.book} .chapter=${this.chapter}></chapter-page>` : html`<p>Loading...</p>`;
      case 'part':
        return this.book && this.chapter && this.activePart ? html`<part-page .book=${this.book} .chapter=${this.chapter} .part=${this.activePart}></part-page>` : html`<p>Loading...</p>`;
      case '404':
      default:
        return html`<page-404></page-404>`;
    }
  }
}