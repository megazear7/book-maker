import { Book } from "../types/book.type.js";
import { Component } from "./component.interface.js";
import { trashIcon } from "./service.icon.js";

export class Characters implements Component {
  book: Book;
  onChange: () => void;

  constructor(book: Book, onChange: () => void) {
    this.book = book;
    this.onChange = onChange;
  }

  render(): string {
    return `
        <div class="secondary-surface">
            <h4>Characters</h4>
            <div id="characters-list">
                ${this.book.characters
                  .map(
                    (character, index) => `
                    <div class="character-item" data-index="${index}" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="text" placeholder="Character Name" value="${character.name}" class="character-name" style="flex: 1; font-weight: bold;">
                            <button class="clean remove-character"><span class="button-inner">${trashIcon}</span></button>
                        </div>
                        <textarea placeholder="Character instructions (personality, background, behavior, etc.)" class="character-instructions" style="width: 100%; min-height: 80px; resize: vertical;">${character.instructions}</textarea>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <button class="tertiary small" id="add-character"><span class="button-inner">Add Character</span></button>
        </div>
    `;
  }

  async addEventListeners(): Promise<void> {
    // Character inputs
    const characterNames: NodeListOf<HTMLInputElement> =
      document.querySelectorAll(".character-name");
    const characterInstructions: NodeListOf<HTMLTextAreaElement> =
      document.querySelectorAll(".character-instructions");
    characterNames.forEach((input, index) => {
      input.addEventListener("input", () => {
        this.book.characters[index].name = input.value;
        this.onChange();
      });
    });
    characterInstructions.forEach((textarea, index) => {
      textarea.addEventListener("input", () => {
        this.book.characters[index].instructions = textarea.value;
        this.onChange();
      });
    });

    // Add character button
    const addButton = document.getElementById("add-character");
    if (addButton) {
      addButton.addEventListener("click", () => {
        this.book.characters.push({ name: "", instructions: "" });
        this.onChange();
        this.renderCharacters();
      });
    }

    // Remove character buttons
    const removeButtons = document.querySelectorAll(".remove-character");
    removeButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        this.book.characters.splice(index, 1);
        this.onChange();
        this.renderCharacters();
      });
    });
  }

  renderCharacters(): void {
    const charactersList = document.getElementById("characters-list");
    if (charactersList) {
      charactersList.innerHTML = this.book.characters
        .map(
          (character, index) => `
        <div class="character-item" data-index="${index}" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" placeholder="Character Name" value="${character.name}" class="character-name" style="flex: 1; font-weight: bold;">
                <button class="clean remove-character"><span class="button-inner">${trashIcon}</span></button>
            </div>
            <textarea placeholder="Character instructions (personality, background, behavior, etc.)" class="character-instructions" style="width: 100%; min-height: 80px; resize: vertical;">${character.instructions}</textarea>
        </div>
      `,
        )
        .join("");
      // Re-add event listeners for the new inputs
      const characterNames: NodeListOf<HTMLInputElement> =
        document.querySelectorAll(".character-name");
      const characterInstructions: NodeListOf<HTMLTextAreaElement> =
        document.querySelectorAll(".character-instructions");
      characterNames.forEach((input, index) => {
        input.addEventListener("input", () => {
          this.book.characters[index].name = input.value;
          this.onChange();
        });
      });
      characterInstructions.forEach((textarea, index) => {
        textarea.addEventListener("input", () => {
          this.book.characters[index].instructions = textarea.value;
          this.onChange();
        });
      });
      const removeButtons = document.querySelectorAll(".remove-character");
      removeButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
          this.book.characters.splice(index, 1);
          this.onChange();
          this.renderCharacters();
        });
      });
    }
  }
}
