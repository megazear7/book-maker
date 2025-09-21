import { Book } from "../types/book.type.js";
import { Component } from "./component.interface.js";
import { trashIcon } from "./service.icon.js";
import { audioIcon } from "./service.icon.js";

export class Pronunciations implements Component {
  book: Book;
  onChange: () => void;
  playingAudio: HTMLAudioElement | null = null;

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
                    <div class="pronunciation-item" data-index="${index}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <input type="text" placeholder="Word" value="${p.match}" class="pronunciation-match" style="flex: 1;">
                        <input type="text" placeholder="Pronunciation" value="${p.replace}" class="pronunciation-replace" style="flex: 1;">
                        <button class="clean preview-pronunciation" data-index="${index}" data-state="idle"><span class="button-inner">${audioIcon}</span></button>
                        <button class="clean remove-pronunciation"><span class="button-inner">${trashIcon}</span></button>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <button class="tertiary small" id="add-pronunciation"><span class="button-inner">Add Pronunciation</span></button>
        </div>
    `;
  }

  async addEventListeners(): Promise<void> {
    // Pronunciation inputs
    const pronunciationMatches: NodeListOf<HTMLInputElement> =
      document.querySelectorAll(".pronunciation-match");
    const pronunciationReplaces: NodeListOf<HTMLInputElement> =
      document.querySelectorAll(".pronunciation-replace");
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

    // Preview pronunciation buttons
    const previewButtons = document.querySelectorAll(".preview-pronunciation");
    previewButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const index = parseInt(
          (e.target as HTMLElement)
            .closest(".preview-pronunciation")
            ?.getAttribute("data-index") || "0",
        );
        await this.previewPronunciation(index);
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

  playAudio(src: string): void {
    if (this.playingAudio) {
      this.playingAudio.pause();
      this.playingAudio.currentTime = 0;
    }
    this.playingAudio = new Audio(src);
    this.playingAudio.play();
  }

  async previewPronunciation(index: number): Promise<void> {
    const word = this.book.pronunciation[index].match.trim();
    if (!word) return;

    const button = document.querySelector(
      `.preview-pronunciation[data-index="${index}"]`,
    ) as HTMLButtonElement;
    if (!button) return;

    // Stop any currently playing audio
    if (this.playingAudio) {
      this.playingAudio.pause();
      this.playingAudio = null;
    }

    // Set loading state
    button.setAttribute("data-state", "loading");
    button.innerHTML = '<span class="button-inner">⟳</span>';

    try {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word, bookId: this.book.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate preview");
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Create audio element and play
      const audio = new Audio(audioUrl);
      this.playingAudio = audio;

      // Set playing state
      button.setAttribute("data-state", "playing");
      button.innerHTML = '<span class="button-inner">▶</span>';

      audio.addEventListener("ended", () => {
        // Reset to idle state
        button.setAttribute("data-state", "idle");
        button.innerHTML = `<span class="button-inner">${audioIcon}</span>`;
        URL.revokeObjectURL(audioUrl);
        this.playingAudio = null;
      });

      audio.addEventListener("error", () => {
        // Reset to idle state on error
        button.setAttribute("data-state", "idle");
        button.innerHTML = `<span class="button-inner">${audioIcon}</span>`;
        URL.revokeObjectURL(audioUrl);
        this.playingAudio = null;
      });

      await audio.play();
    } catch (error) {
      console.error("Preview failed:", error);
      // Reset to idle state on error
      button.setAttribute("data-state", "idle");
      button.innerHTML = `<span class="button-inner">${audioIcon}</span>`;
    }
  }

  renderPronunciations(): void {
    const pronunciationsList = document.getElementById("pronunciations-list");
    if (pronunciationsList) {
      pronunciationsList.innerHTML = this.book.pronunciation
        .map(
          (p, index) => `
        <div class="pronunciation-item" data-index="${index}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
          <input type="text" placeholder="Word" value="${p.match}" class="pronunciation-match" style="flex: 1;">
          <input type="text" placeholder="Pronunciation" value="${p.replace}" class="pronunciation-replace" style="flex: 1;">
          <button class="clean preview-pronunciation" data-index="${index}" data-state="idle"><span class="button-inner">${audioIcon}</span></button>
          <button class="clean remove-pronunciation"><span class="button-inner">${trashIcon}</span></button>
        </div>
      `,
        )
        .join("");
      // Re-add event listeners for the new inputs
      const pronunciationMatches: NodeListOf<HTMLInputElement> =
        document.querySelectorAll(".pronunciation-match");
      const pronunciationReplaces: NodeListOf<HTMLInputElement> =
        document.querySelectorAll(".pronunciation-replace");
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
      const previewButtons = document.querySelectorAll(
        ".preview-pronunciation",
      );
      previewButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
          this.previewPronunciation(index);
        });
      });
    }
  }
}
