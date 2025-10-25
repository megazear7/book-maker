import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Book } from '../types/book.type.js';
import { trashIcon } from './service.icon.js';

@customElement('characters-component')
export class CharactersComponent extends LitElement {
  @property({ type: Object })
  book!: Book;

  @property({ type: Function })
  onChange!: () => void;

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

    .character-item {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 15px;
      padding: 10px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      background: white;
    }

    .character-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .character-name {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-weight: bold;
      font-size: 14px;
    }

    .character-name:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .remove-character {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: #dc3545;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-character:hover {
      background: #f8d7da;
    }

    .character-instructions {
      width: 100%;
      min-height: 80px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
      font-family: inherit;
      font-size: 14px;
    }

    .character-instructions:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .add-character {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 16px;
    }

    .add-character:hover {
      background: #5a6268;
    }

    .button-inner {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `;

  private handleNameChange(index: number, value: string) {
    this.book.characters[index].name = value;
    this.onChange();
  }

  private handleInstructionsChange(index: number, value: string) {
    this.book.characters[index].instructions = value;
    this.onChange();
  }

  private addCharacter() {
    this.book.characters.push({ name: '', instructions: '' });
    this.onChange();
    this.requestUpdate();
  }

  private removeCharacter(index: number) {
    this.book.characters.splice(index, 1);
    this.onChange();
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="secondary-surface">
        <h4>Characters</h4>
        <div id="characters-list">
          ${this.book.characters.map((character, index) => html`
            <div class="character-item">
              <div class="character-header">
                <input
                  type="text"
                  placeholder="Character Name"
                  .value=${character.name}
                  class="character-name"
                  @input=${(e: Event) => this.handleNameChange(index, (e.target as HTMLInputElement).value)}
                />
                <button
                  class="remove-character"
                  @click=${() => this.removeCharacter(index)}
                  title="Remove character"
                >
                  <span class="button-inner">${trashIcon}</span>
                </button>
              </div>
              <textarea
                placeholder="Character instructions (personality, background, behavior, etc.)"
                .value=${character.instructions}
                class="character-instructions"
                @input=${(e: Event) => this.handleInstructionsChange(index, (e.target as HTMLTextAreaElement).value)}
              ></textarea>
            </div>
          `)}
        </div>
        <button class="add-character" @click=${this.addCharacter}>
          <span class="button-inner">Add Character</span>
        </button>
      </div>
    `;
  }
}