import { Book } from "../types/book.type.js";
import { Component } from "./component.interface.js";

export class Pronunciations implements Component {
  book: Book;
  onChange: () => void;

  constructor(book: Book, onChange: () => void) {
    this.book = book;
    this.onChange = onChange;
  }

  render(): string {
    return `
        <div class="secondary-surface">
            <h4>Pronunciations</h4>
            <div id="pronunciations-list">
                ${this.book.pronunciation
                  .map(
                    (p, index) => `
                    <div class="pronunciation-item" data-index="${index}">
                        <input type="text" placeholder="Match" value="${p.match}" class="pronunciation-match">
                        <input type="text" placeholder="Replace" value="${p.replace}" class="pronunciation-replace">
                        <button class="clean remove-pronunciation"><span class="button-inner">Remove</span></button>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <button class="clean" id="add-pronunciation"><span class="button-inner">Add Pronunciation</span></button>
        </div>
    `;
  }

  async addEventListeners(): Promise<void> {
    // Pronunciation inputs
    const pronunciationMatches: NodeListOf<HTMLInputElement> = document.querySelectorAll(".pronunciation-match");
    const pronunciationReplaces: NodeListOf<HTMLInputElement> = document.querySelectorAll(".pronunciation-replace");
    pronunciationMatches.forEach((input, index) => {
      input.addEventListener("input", () => {
        this.book.pronunciation[index].match = input.value;
        this.onChange();
      });
    });
    pronunciationReplaces.forEach((input, index) => {
      input.addEventListener("input", () => {
        this.book.pronunciation[index].replace = input.value;
        this.onChange();
      });
    });

    // Add pronunciation button
    const addPronunciationButton = document.getElementById("add-pronunciation");
    if (addPronunciationButton) {
      addPronunciationButton.addEventListener("click", () => {
        this.book.pronunciation.push({ match: "", replace: "" });
        this.onChange();
        this.renderPronunciations();
      });
    }

    // Remove pronunciation buttons
    const removeButtons = document.querySelectorAll(".remove-pronunciation");
    removeButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        this.book.pronunciation.splice(index, 1);
        this.onChange();
        this.renderPronunciations();
      });
    });
  }

  renderPronunciations(): void {
    const pronunciationsList = document.getElementById("pronunciations-list");
    if (pronunciationsList) {
      pronunciationsList.innerHTML = this.book.pronunciation
        .map(
          (p, index) => `
        <div class="pronunciation-item" data-index="${index}">
          <input type="text" placeholder="Match" value="${p.match}" class="pronunciation-match">
          <input type="text" placeholder="Replace" value="${p.replace}" class="pronunciation-replace">
          <button class="clean remove-pronunciation"><span class="button-inner">Remove</span></button>
        </div>
      `,
        )
        .join("");
      // Re-add event listeners for the new inputs
      const pronunciationMatches: NodeListOf<HTMLInputElement> = document.querySelectorAll(".pronunciation-match");
      const pronunciationReplaces: NodeListOf<HTMLInputElement> = document.querySelectorAll(".pronunciation-replace");
      pronunciationMatches.forEach((input, index) => {
        input.addEventListener("input", () => {
          this.book.pronunciation[index].match = input.value;
          this.onChange();
        });
      });
      pronunciationReplaces.forEach((input, index) => {
        input.addEventListener("input", () => {
          this.book.pronunciation[index].replace = input.value;
          this.onChange();
        });
      });
      const removeButtons = document.querySelectorAll(".remove-pronunciation");
      removeButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
          this.book.pronunciation.splice(index, 1);
          this.onChange();
          this.renderPronunciations();
        });
      });
    }
  }
}