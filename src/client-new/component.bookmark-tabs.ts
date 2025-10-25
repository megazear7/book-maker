import { LitElement, html, css } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { PageName } from '../types/app.type.js';

@customElement('bookmark-tabs')
export class BookmarkTabs extends LitElement {
  @property({ type: String })
  pageName: PageName = 'home';

  @queryAll('.bookmark-tab')
  private tabs!: NodeListOf<HTMLElement>;

  private scrollHandler = () => this.highlightTab();
  private resizeHandler = () => this.highlightTab();

  static styles = css`
    .bookmark-tabs {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      gap: 0;
    }

    .bookmark-tab {
      flex: 1;
      text-align: center;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.2s ease;
      background: #f8f9fa;
    }

    .bookmark-tab:not(.disabled):hover {
      background: #e9ecef;
    }

    .bookmark-tab.active {
      background: white;
      border-bottom-color: #007bff;
      color: #007bff;
      font-weight: 600;
    }

    .bookmark-tab.disabled {
      color: #6c757d;
      cursor: not-allowed;
      background: #f8f9fa;
    }

    .bookmark-tab-inner {
      display: block;
      font-size: 14px;
      font-weight: 500;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.resizeHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }

  firstUpdated() {
    this.highlightTab();
    this.setupClickHandlers();
  }

  render() {
    const isBookEnabled = ['book', 'chapter', 'part'].includes(this.pageName);
    const isChapterEnabled = ['chapter', 'part'].includes(this.pageName);
    const isPartEnabled = ['part'].includes(this.pageName);

    return html`
      <div class="bookmark-tabs">
        <div class="bookmark-tab ${isBookEnabled ? '' : 'disabled'}" data-tab="book">
          <span class="bookmark-tab-inner">Book</span>
        </div>
        <div class="bookmark-tab ${isChapterEnabled ? '' : 'disabled'}" data-tab="chapter">
          <span class="bookmark-tab-inner">Chapter</span>
        </div>
        <div class="bookmark-tab ${isPartEnabled ? '' : 'disabled'}" data-tab="part">
          <span class="bookmark-tab-inner">Part</span>
        </div>
      </div>
    `;
  }

  private highlightTab() {
    const bookSection = document.querySelector('[data-section="book"]') as HTMLElement;
    const chapterSection = document.querySelector('[data-section="chapter"]') as HTMLElement;
    const partSection = document.querySelector('[data-section="part"]') as HTMLElement;

    let active = '';
    const viewportHeight = window.innerHeight;

    if (partSection && partSection.getBoundingClientRect().top < viewportHeight / 2) {
      active = 'part';
    } else if (chapterSection && chapterSection.getBoundingClientRect().top < viewportHeight / 2) {
      active = 'chapter';
    } else if (bookSection && bookSection.getBoundingClientRect().top < viewportHeight / 2) {
      active = 'book';
    }

    this.tabs.forEach(tab => {
      if (tab.dataset.tab === active) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  private setupClickHandlers() {
    this.tabs.forEach(tab => {
      if (tab.classList.contains('disabled')) return;

      tab.addEventListener('click', () => {
        const tabType = tab.dataset.tab;
        if (tabType === 'book') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          let section: HTMLElement | null = null;
          if (tabType === 'chapter') {
            section = document.querySelector('[data-section="chapter"]') as HTMLElement;
          } else if (tabType === 'part') {
            section = document.querySelector('[data-section="part"]') as HTMLElement;
          }
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }
}