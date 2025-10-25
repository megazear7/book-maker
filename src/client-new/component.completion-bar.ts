import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Book } from '../types/book.type.js';

@customElement('completion-bar')
export class CompletionBar extends LitElement {
  @property({ type: Object })
  book!: Book;

  static styles = css`
    .completion-bar {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 20px 0;
    }

    .completion-bar-chapter {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .completion-bar-chapter-label {
      font-weight: 600;
      color: #333;
      text-decoration: none;
      min-width: 120px;
    }

    .completion-bar-chapter-label:hover {
      text-decoration: underline;
    }

    .completion-bar-parts {
      display: flex;
      gap: 4px;
      flex: 1;
    }

    .completion-bar-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .completion-bar-segment.empty {
      background: #f8f9fa;
      color: #6c757d;
      border: 1px solid #dee2e6;
    }

    .completion-bar-segment.written {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .completion-bar-segment.audio {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .completion-bar-segment.written-audio {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      position: relative;
    }

    .completion-bar-segment.written-audio::after {
      content: '♪';
      position: absolute;
      top: -2px;
      right: -2px;
      font-size: 10px;
      background: #17a2b8;
      color: white;
      border-radius: 50%;
      width: 12px;
      height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .completion-bar-segment:hover {
      transform: scale(1.1);
    }

    .completion-bar-segment-label {
      pointer-events: none;
    }
  `;

  render() {
    if (!this.book?.chapters?.length) {
      return html``;
    }

    return html`
      <div class="completion-bar">
        ${this.book.chapters.map(chapter => this.renderChapter(chapter))}
      </div>
    `;
  }

  private renderChapter(chapter: any) {
    let expectedParts = chapter.parts.length || chapter.maxParts || chapter.minParts;
    if (typeof expectedParts !== "number" || expectedParts < chapter.parts.length) {
      expectedParts = chapter.parts.length;
    }

    return html`
      <div class="completion-bar-chapter">
        <a href="/book/${this.book.id}/chapter/${chapter.number}" class="completion-bar-chapter-label">
          Chapter ${chapter.number}
        </a>
        <div class="completion-bar-parts">
          ${Array.from({ length: expectedParts }, (_, idx) => this.renderPart(chapter, idx))}
        </div>
      </div>
    `;
  }

  private renderPart(chapter: any, idx: number) {
    const part = chapter.parts[idx];
    const written = part && part.text && part.text.trim().length > 0;
    const audio = part && !!part.audio;
    const isEmpty = !part;

    const msg = written && audio
      ? "is written and has audio"
      : written
        ? "is written"
        : audio
          ? "has audio"
          : "is not yet written";

    let classes = "completion-bar-segment";
    if (isEmpty) classes += " empty";
    else if (written && audio) classes += " written-audio";
    else if (written) classes += " written";
    else if (audio) classes += " audio";

    const title = `Chapter ${chapter.number} part ${idx + 1} ${msg}`;

    if (isEmpty) {
      return html`
        <div title="${title}" class="${classes}">
          <span class="completion-bar-segment-label">${idx + 1}</span>
        </div>
      `;
    } else {
      return html`
        <a href="/book/${this.book.id}/chapter/${chapter.number}/part/${idx + 1}"
           title="${title}" class="${classes}">
          <span class="completion-bar-segment-label">${idx + 1}</span>
        </a>
      `;
    }
  }
}