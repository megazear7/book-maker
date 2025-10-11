import { Book, ReferenceUse } from "../types/book.type.js";
import { Component } from "./component.interface.js";
import { trashIcon } from "./service.icon.js";
import { createModal } from "./service.modal.js";
import { getZodEnumValues } from "../shared/util.js";

export class References implements Component {
  book: Book;
  onChange: () => void;

  constructor(book: Book, onChange: () => void) {
    this.book = book;
    this.onChange = onChange;
  }

  private isValidFileType(file: File): boolean {
    const allowedExtensions = [".txt", ".docx", ".pdf"];
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some((ext) => fileName.endsWith(ext));
  }

  private showFileError(): void {
    const fileNameDiv = document.getElementById("file-name");
    if (fileNameDiv) {
      fileNameDiv.textContent =
        "Error: Only .txt, .docx, and .pdf files are allowed";
      fileNameDiv.style.color = "var(--color-error, #ff4444)";
    }
  }

  private clearFileError(): void {
    const fileNameDiv = document.getElementById("file-name");
    if (fileNameDiv) {
      fileNameDiv.style.color = "var(--color-primary-text)";
    }
  }

  // TODO Update how the component is rendered so that it can update dynamically
  render(): string {
    // TODO Improve the styles of the add reference button to match the rest of the app
    return `
        <div class="secondary-surface">
            <h4>References</h4>
            <div id="references-list">
                ${this.book.references
                  .map(
                    (ref, index) => `
                    <div class="reference-item" data-index="${index}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <button class="clean reference-file" data-index="${index}"><span class="button-inner">${ref.file.split("/").pop() || "No file"}</span></button>
                        <button class="clean remove-reference" data-index="${index}"><span class="button-inner">${trashIcon}</span></button>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <button class="tertiary small" id="references-add-reference"><span class="button-inner">Add Reference</span></button>
        </div>
    `;
  }

  async addEventListeners(): Promise<void> {
    // Add reference button
    const addButton = document.getElementById("references-add-reference");
    if (addButton) {
      addButton.addEventListener("click", () => {
        this.book.references.push({
          file: "",
          instructions: "",
          whenToUse: [],
        });
        this.onChange();
        this.renderReferences();
      });
    }

    // Remove buttons
    this.setupRemoveListeners();

    // File buttons
    this.setupFileListeners();
  }

  setupRemoveListeners(): void {
    const removeButtons = document.querySelectorAll(".remove-reference");
    removeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = parseInt(
          ((e.target as HTMLElement).closest(".reference-item") as HTMLElement)
            ?.dataset.index || "0",
        );
        this.book.references.splice(index, 1);
        this.onChange();
        this.renderReferences();
      });
    });
  }

  setupFileListeners(): void {
    const fileButtons = document.querySelectorAll(".reference-file");
    fileButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = parseInt(
          ((e.target as HTMLElement).closest(".reference-item") as HTMLElement)
            ?.dataset.index || "0",
        );
        this.openReferenceModal(index);
      });
    });
  }

  openReferenceModal(index: number): void {
    const ref = this.book.references[index];
    createModal(
      "Edit Reference",
      "Save",
      [
        {
          name: "file",
          label: "File",
          type: "custom",
          html: `<div id="file-drop" style="border: 2px dashed #ccc; padding: 20px; text-align: center;">Drop file here or click to select (txt, docx, pdf)</div><input type="file" id="file-input" accept=".txt,.docx,.pdf" style="display: none;"><div id="file-name" style="margin-top: 10px; font-size: 14px; color: var(--color-primary-text);">${ref.file ? ref.file.split("/").pop() : "No file selected"}</div>`,
        },
        {
          name: "instructions",
          label: "Instructions",
          type: "textarea",
          value: ref.instructions,
        },
        {
          name: "whenToUse",
          label: "When to Use",
          type: "multiselect",
          options: getZodEnumValues(ReferenceUse).map((value) => ({
            label: value.charAt(0).toUpperCase() + value.slice(1),
            value,
          })),
          selected: ref.whenToUse,
        },
      ],
      async (result) => {
        ref.instructions = String(
          result.find((r) => r.name === "instructions")?.value || "",
        );
        ref.whenToUse =
          (result.find((r) => r.name === "whenToUse")?.value as (
            | "outlining"
            | "writing"
            | "editing"
            | "plot"
          )[]) || [];
        this.onChange();
        // Save to server
        await fetch(`/api/book/${this.book.id}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.book),
        });
      },
    );

    // Setup file drop after modal is created
    setTimeout(() => {
      this.setupFileDrop(index);
    }, 100);

    // Update drop text based on existing file
    setTimeout(() => {
      const fileDrop = document.getElementById("file-drop");
      if (fileDrop) {
        fileDrop.textContent = ref.file
          ? "Drop file here or click to select to replace the file (docx, pdf, txt)"
          : "Drop file here or click to select (docx, pdf, txt)";
      }
    }, 100);
  }

  // TODO improve the styles of the file drop area
  setupFileDrop(index: number): void {
    const dropArea = document.getElementById("file-drop");
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (dropArea && fileInput) {
      dropArea.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          if (!this.isValidFileType(file)) {
            this.showFileError();
            return;
          }
          this.clearFileError();
          this.uploadFile(file, index);
          // Update file name display
          const fileNameDiv = document.getElementById("file-name");
          if (fileNameDiv) {
            fileNameDiv.textContent = file.name;
          }
          // Update drop text
          dropArea.textContent =
            "Drop file here or click to select to replace the file (docx, pdf, txt)";
        }
      });
      dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.style.borderColor = "#000";
      });
      dropArea.addEventListener("dragleave", () => {
        dropArea.style.borderColor = "#ccc";
      });
      dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.style.borderColor = "#ccc";
        const file = e.dataTransfer?.files[0];
        if (file) {
          if (!this.isValidFileType(file)) {
            this.showFileError();
            return;
          }
          this.clearFileError();
          this.uploadFile(file, index);
          // Update file name display
          const fileNameDiv = document.getElementById("file-name");
          if (fileNameDiv) {
            fileNameDiv.textContent = file.name;
          }
          // Update drop text
          dropArea.textContent =
            "Drop file here or click to select to replace the file (docx, pdf, txt)";
        }
      });
    }
  }

  async uploadFile(file: File, index: number): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(
      `/api/book/${this.book.id}/reference/${file.name}`,
      {
        method: "POST",
        body: formData,
      },
    );
    if (response.ok) {
      this.book.references[index].file =
        `books/book.${this.book.id}.references/${file.name}`;
      this.onChange();
    }
  }

  renderReferences(): void {
    const list = document.getElementById("references-list");
    if (list) {
      list.innerHTML = this.book.references
        .map(
          (ref, index) => `
        <div class="reference-item" data-index="${index}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
          <button class="clean reference-file" data-index="${index}"><span class="button-inner">${ref.file.split("/").pop() || "No file"}</span></button>
          <button class="clean remove-reference" data-index="${index}"><span class="button-inner">${trashIcon}</span></button>
        </div>
      `,
        )
        .join("");
      this.setupRemoveListeners();
      this.setupFileListeners();
    }
  }
}
