import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Book } from '../types/book.type.js';
import { trashIcon, audioIcon } from './service.icon.js';

@customElement('pronunciations-component')
export class PronunciationsComponent extends LitElement {
  @property({ type: Object })
  book!: Book;

  @property({ type: Function })
  onChange!: () => void;

  @state()
  private playingStates: Map<number, 'idle' | 'loading' | 'playing'> = new Map();

  private playingAudio: HTMLAudioElement | null = null;

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

    .pronunciation-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      padding: 8px;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }

    .pronunciation-match,
    .pronunciation-replace {
      flex: 1;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .pronunciation-match:focus,
    .pronunciation-replace:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .preview-pronunciation {
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      transition: all 0.2s ease;
    }

    .preview-pronunciation:hover:not(:disabled) {
      background: #f8f9fa;
    }

    .preview-pronunciation:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .preview-pronunciation[data-state="loading"] {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .remove-pronunciation {
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

    .remove-pronunciation:hover {
      background: #f8d7da;
    }

    .add-pronunciation {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 16px;
    }

    .add-pronunciation:hover {
      background: #5a6268;
    }

    .button-inner {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `;

  private handleMatchChange(index: number, value: string) {
    this.book.pronunciation[index].match = value;
    this.onChange();
  }

  private handleReplaceChange(index: number, value: string) {
    this.book.pronunciation[index].replace = value;
    this.onChange();
  }

  private addPronunciation() {
    this.book.pronunciation.push({ match: '', replace: '' });
    this.onChange();
    this.requestUpdate();
  }

  private removePronunciation(index: number) {
    this.book.pronunciation.splice(index, 1);
    this.onChange();
    this.requestUpdate();
  }

  private async previewPronunciation(index: number) {
    const word = this.book.pronunciation[index].match.trim();
    if (!word) return;

    // Stop any currently playing audio
    if (this.playingAudio) {
      this.playingAudio.pause();
      this.playingAudio = null;
    }

    // Set loading state
    this.playingStates.set(index, 'loading');
    this.requestUpdate();

    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, bookId: this.book.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Create audio element and play
      const audio = new Audio(audioUrl);
      this.playingAudio = audio;

      // Set playing state
      this.playingStates.set(index, 'playing');
      this.requestUpdate();

      audio.addEventListener('ended', () => {
        this.playingStates.set(index, 'idle');
        URL.revokeObjectURL(audioUrl);
        this.playingAudio = null;
        this.requestUpdate();
      });

      audio.addEventListener('error', () => {
        this.playingStates.set(index, 'idle');
        URL.revokeObjectURL(audioUrl);
        this.playingAudio = null;
        this.requestUpdate();
      });

      await audio.play();
    } catch (error) {
      console.error('Preview failed:', error);
      this.playingStates.set(index, 'idle');
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div class="secondary-surface">
        <h4>Pronunciations</h4>
        <div id="pronunciations-list">
          ${this.book.pronunciation.map((p, index) => {
            const state = this.playingStates.get(index) || 'idle';
            return html`
              <div class="pronunciation-item">
                <input
                  type="text"
                  placeholder="Word"
                  .value=${p.match}
                  class="pronunciation-match"
                  @input=${(e: Event) => this.handleMatchChange(index, (e.target as HTMLInputElement).value)}
                />
                <input
                  type="text"
                  placeholder="Pronunciation"
                  .value=${p.replace}
                  class="pronunciation-replace"
                  @input=${(e: Event) => this.handleReplaceChange(index, (e.target as HTMLInputElement).value)}
                />
                <button
                  class="preview-pronunciation"
                  data-state=${state}
                  ?disabled=${state === 'loading'}
                  @click=${() => this.previewPronunciation(index)}
                  title="Preview pronunciation"
                >
                  <span class="button-inner">
                    ${state === 'loading' ? '⟳' : state === 'playing' ? '▶' : audioIcon}
                  </span>
                </button>
                <button
                  class="remove-pronunciation"
                  @click=${() => this.removePronunciation(index)}
                  title="Remove pronunciation"
                >
                  <span class="button-inner">${trashIcon}</span>
                </button>
              </div>
            `;
          })}
        </div>
        <button class="add-pronunciation" @click=${this.addPronunciation}>
          <span class="button-inner">Add Pronunciation</span>
        </button>
      </div>
    `;
  }
}