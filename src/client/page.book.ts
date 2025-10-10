import {
  Book,
  Chapter,
  ChapterPart,
  ChapterPartNumber,
} from "../types/book.type.js";
import { CompletionBar } from "./component.completion-bar.js";
import { Pronunciations } from "./component.pronunciation.js";
import { Characters } from "./component.characters.js";

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
} from "./service.icon.js";
import { createModal } from "./service.modal.js";
import { Page } from "./page.interface.js";
import {
  addChapter,
  createChapter,
  createChapterAudio,
  createChapterOutline,
  createChapterPart,
  createChapterPartAudio,
  downloadFullAudio,
  generateEverythingApi,
} from "./service.api.js";
import { formatNumber } from "./service.util.js";
import { openBookConfigurationModal } from "./modal.book-configuration.js";
import { openBookDetailsModal } from "./modal.book-details.js";
import { openDownloadBookModal } from "./modal.download-book.js";
import { openEditPartModal } from "./modal.edit-part.js";
import { References } from "./component.references.js";
import { generateProperty } from "./service.generate-property.js";

export class BookPage implements Page {
  book: Book;
  activeChapter?: Chapter;
  activePart?: ChapterPart;
  activePartNumber?: ChapterPartNumber;
  hasChanges: boolean = false;
  pronunciationsComponent: Pronunciations;
  referencesComponent: References;
  charactersComponent: Characters;

  constructor(
    book: Book,
    activeChapter?: Chapter,
    activePart?: ChapterPart,
    activePartNumber?: ChapterPartNumber,
  ) {
    this.book = book;
    this.activeChapter = activeChapter;
    this.activePart = activePart;
    this.activePartNumber = activePartNumber;
    this.pronunciationsComponent = new Pronunciations(book, () => {
      this.hasChanges = true;
    });
    this.referencesComponent = new References(book, () => {
      this.hasChanges = true;
    });
    this.charactersComponent = new Characters(book, () => {
      this.hasChanges = true;
    });
  }

  render(root: HTMLElement): void {
    const book = this.book;
    const activeChapter = this.activeChapter;
    const activePart = this.activePart;
    const activePartNumber = this.activePartNumber;
    const million = 1000000;
    const tokens = formatNumber(
      book.model.text.usage.completion_tokens +
        book.model.text.usage.prompt_tokens,
    );
    const cost = formatNumber(
      book.model.text.usage.completion_tokens *
        (book.model.text.cost.outputTokenCost / million) +
        book.model.text.usage.prompt_tokens *
          (book.model.text.cost.inputTokenCost / million),
      { decimals: 2 },
    );
    const wordCount = formatNumber(
      book.chapters
        .map((chapter) => chapter.parts.map((part) => part.text).join(" "))
        .join(" ")
        .split(/\s+/).length,
    );
    const usage = `${tokens} tokens&nbsp;&nbsp;&nbsp;&nbsp;$${cost}&nbsp;&nbsp;&nbsp;&nbsp;${wordCount} words`;

    root.innerHTML = `
        ${new CompletionBar(book).render()}
        <div class="spread">
          <div>
            <button id="download-book" class="secondary"><span class="button-inner">${downloadIcon} Download Book</span></button>
            <button id="download-audio" class="secondary"><span class="button-inner">${downloadIcon} Download Audio</span></button>
            <button id="configure-model" class="secondary"><span class="button-inner">${gearIcon} Configure</span></button>
            <button id="edit-details" class="secondary"><span class="button-inner">${detailsIcon} Details</span></button>
            <button id="create-book-everything" class="secondary"><span class="button-inner">${aiIconLeft}<span>Generate everything</span>${aiIconRight}</span></span></button>
          </div>

          <div>
            <button id="delete-book" class="tertiary warning"><span class="button-inner">${trashIcon} Delete Book</span></button>
          </div>
        </div>

        <div class="secondary-surface">
            <input name="book.title" value="${book.title}" class="h1"></textarea>
            <div class="spread">
              <span>${usage}</span>
              <span class="save-status">${this.hasChanges ? "Saving" : "Saved"}</span>
            </div>
        </div>

        <div class="secondary-surface">
            <h4>Overview</h4>
            <div class="textarea-wrapper">
              <div class="textarea-actions">
                <button data-property="book.overview" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
              </div>
              <textarea name="book.overview">${book.overview}</textarea>
            </div>
            <h4>Edit Instructions</h4>
            <div class="textarea-wrapper">
              <div class="textarea-actions">
                <button data-property="book.instructions.edit" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
              </div>
              <textarea name="book.instructions.edit">${book.instructions.edit}</textarea>
            </div>
        </div>

        <div class="secondary-surface">
            <h4>Audio Instructions</h4>

            <div class="textarea-wrapper">
              <div class="textarea-actions">
                <button data-property="book.instructions.audio" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
              </div>
              <textarea name="book.instructions.audio">${book.instructions.audio}</textarea>
            </div>
        </div>

        ${this.pronunciationsComponent.render()}

        ${this.referencesComponent.render()}

        ${this.charactersComponent.render()}

        <div data-section="chapter" data-scroll-priority="${activeChapter ? 2 : 1}"></div>

        <ul class="pills">
            ${book.chapters
              .map(
                (chapter) => `
                <li class="${chapter.number === activeChapter?.number ? "active" : ""}"><a href="/book/${book.id}/chapter/${chapter.number}">Chapter ${chapter.number}: ${chapter.title}</a></li>
            `,
              )
              .join("")}
            <li><button class="clean" id="add-chapter"><span class="button-inner">${plusIcon}Add Chapter</span></button>
        </ul>

        ${
          activeChapter
            ? `
            <div class="secondary-surface">
                <h4 >Chapter ${activeChapter.number}</h4>
                <h2><input name="activeChapter.title" class="h2" value="${activeChapter.title}"></input></h2>
            </div>

            <div class="secondary-surface">
                <h4>When</h4>
                <div class="textarea-wrapper">
                  <div class="textarea-actions">
                    <button data-property="book.chapters[${activeChapter.number - 1}].audio" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
                  </div>
                  <textarea name="activeChapter.when">${activeChapter.when}</textarea>
                </div>

                <h4>Where</h4>
                <div class="textarea-wrapper">
                  <div class="textarea-actions">
                    <button data-property="book.chapters[${activeChapter.number - 1}].where" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
                  </div>
                  <textarea name="activeChapter.where">${activeChapter.where}</textarea>
                </div>

                <h4>What</h4>
                <div class="textarea-wrapper">
                  <div class="textarea-actions">
                    <button data-property="book.chapters[${activeChapter.number - 1}].what" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
                  </div>
                  <textarea name="activeChapter.what">${activeChapter.what}</textarea>
                </div>

                <h4>Why</h4>
                <div class="textarea-wrapper">
                  <div class="textarea-actions">
                    <button data-property="book.chapters[${activeChapter.number - 1}].why" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
                  </div>
                  <textarea name="activeChapter.why">${activeChapter.why}</textarea>
                </div>

                <h4>How</h4>
                <div class="textarea-wrapper">
                  <div class="textarea-actions">
                    <button data-property="book.chapters[${activeChapter.number - 1}].how" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
                  </div>
                  <textarea name="activeChapter.how">${activeChapter.how}</textarea>
                </div>

                <h4>Who</h4>
                <div class="textarea-wrapper">
                  <div class="textarea-actions">
                    <button data-property="book.chapters[${activeChapter.number - 1}].who" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
                  </div>
                  <textarea name="activeChapter.who">${activeChapter.who}</textarea>
                </div>
            </div>

            <div class="secondary-surface">
                <h4>Minimum Parts</h4>
                <input name="activeChapter.minParts" type="text" value="${activeChapter.minParts}"></input>

                <h4>Maximum Parts</h4>
                <input name="activeChapter.maxParts" type="text" value="${activeChapter.maxParts}"></input>

                <h4>Estimated Part Length in Words</h4>
                <input name="activeChapter.partLength" type="number" value="${activeChapter.partLength}"></input>
            </div>

            <button id="create-chapter-outline"><span class="button-inner">${aiIconLeft}<span>${activeChapter.outline.length > 0 ? "Regenerate" : "Generate"} Outline</span>${aiIconRight}</span></button>
            <button id="create-chapter"><span class="button-inner">${aiIconLeft}<span>${activeChapter.parts.length > 0 ? "Regenerate" : "Generate"} Chapter</span>${aiIconRight}</span></button>
            <button id="create-chapter-audio"><span class="button-inner">${aiIconLeft}<span>${activeChapter.parts[0]?.audio ? "Regenerate" : "Generate"} Audio</span>${aiIconRight}</span></button>
            <button id="create-chapter-everything"><span class="button-inner">${aiIconLeft}<span>Generate everything</span>${aiIconRight}</span></button>

            ${
              activeChapter.outline
                ? `
                <div class="secondary-surface">
                    <h4>Chapter Outline</h4>
                    ${activeChapter.outline
                      .map(
                        (partDescription, index) => `
                        <h5>Part ${index + 1}</h5>
                        <div class="textarea-wrapper">
                          <div class="textarea-actions">
                            <button data-property="book.chapters[${activeChapter.number - 1}].outline[${index}]" class="generate-instructions clean"><span class="button-inner">${refreshIcon}</span></button>
                          </div>
                          <textarea name="activeChapter.outline[${index}]">${partDescription}</textarea>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `
                : ""
            }

            ${
              activeChapter.parts.length > 0
                ? `
                <ul data-section="part" data-scroll-priority="${activePart ? 3 : 0}" class="pills">
                    ${activeChapter.parts
                      .map(
                        (part, index) => `
                        <li class="${activePartNumber && index === activePartNumber - 1 ? "active" : ""}"><a href="/book/${book.id}/chapter/${activeChapter.number}/part/${index + 1}">Part ${index + 1}</a></li>
                    `,
                      )
                      .join("")}
                </ul>
            `
                : `
            `
            }

            ${
              activePart
                ? `
                <button id="create-chapter-part"><span class="button-inner">${aiIconLeft}<span>${activePart.text ? "Regenerate" : "Generate"} Part</span>${aiIconRight}</span></button>
                <button id="edit-chapter-part"><span class="button-inner">${editIcon} Edit Part</span></button>
                <button id="create-chapter-part-audio"><span class="button-inner">${aiIconLeft}<span>${activePart.audio ? "Regenerate" : "Generate"} Audio</span>${aiIconRight}</span></button>
                ${
                  activePart.audio
                    ? `
                  <audio id="audio-player"></audio>
                `
                    : ""
                }

                <div class="secondary-surface">
                    <div>
                      ${
                        activePart.audio
                          ? `
                        <button class="secondary audio-button" id="play-audio" style="display:inline-block;"><span class="button-inner">${audioIcon} Play Audio</span></button>
                        <button class="secondary audio-button" id="pause-audio" style="display:none;"><span class="button-inner">⏸ Pause Audio</span></button>
                      `
                          : ""
                      }
                    </div>
                    <textarea name="activePart.text">${activePart.text}</textarea>
                </div>
            `
                : ""
            }
        `
            : ""
        }
        `;
  }

  async addEventListeners(): Promise<void> {
    const configureModelButton = document.getElementById("configure-model");
    if (configureModelButton) {
      configureModelButton.addEventListener("click", async () => {
        await openBookConfigurationModal(this.book);
      });
    }
    const editDetailsButton = document.getElementById("edit-details");
    if (editDetailsButton) {
      editDetailsButton.addEventListener("click", async () => {
        await openBookDetailsModal(this.book);
      });
    }
    const createChapterOutlineButton = document.getElementById(
      "create-chapter-outline",
    );
    const addChapterButton = document.getElementById("add-chapter");
    const createChapterButton = document.getElementById("create-chapter");
    const createChapterAudioButton = document.getElementById(
      "create-chapter-audio",
    );
    const createChapterPartButton = document.getElementById(
      "create-chapter-part",
    );
    const editChapterPartButton = document.getElementById(
      "edit-chapter-part",
    );
    const createChapterPartAudioButton = document.getElementById(
      "create-chapter-part-audio",
    );
    const audioPlayer = document.getElementById(
      "audio-player",
    ) as HTMLAudioElement;
    const playAudioButton = document.getElementById("play-audio");
    const pauseAudioButton = document.getElementById("pause-audio");
    const downloadBookButton = document.getElementById("download-book");
    const downloadAudioButton = document.getElementById("download-audio");
    const deleteBookButton = document.getElementById("delete-book");
    const createBookEverythingButton = document.getElementById(
      "create-book-everything",
    );
    const createChapterEverythingButton = document.getElementById(
      "create-chapter-everything",
    );
    const book = this.book;
    const activeChapter = this.activeChapter;
    const activePartNumber = this.activePartNumber;
    const activePart = this.activePart;

    if (createChapterOutlineButton && activeChapter) {
      createChapterOutlineButton.addEventListener("click", async () => {
        await createChapterOutline(book, activeChapter);
        window.location.pathname = `/book/${book.id}/chapter/${activeChapter.number}`;
      });
    }

    if (createChapterButton && activeChapter) {
      createChapterButton.addEventListener("click", async () => {
        await createChapter(book, activeChapter);
        window.location.pathname = `/book/${book.id}/chapter/${activeChapter.number}`;
      });
    }

    if (createChapterAudioButton && activeChapter) {
      createChapterAudioButton.addEventListener("click", async () => {
        await createChapterAudio(book, activeChapter);
        window.location.pathname = `/book/${book.id}/chapter/${activeChapter.number}`;
      });
    }

    if (createChapterPartButton && activeChapter && activePartNumber) {
      createChapterPartButton.addEventListener("click", async () => {
        await createChapterPart(book, activeChapter, activePartNumber);
        window.location.pathname = `/book/${book.id}/chapter/${activeChapter?.number}/part/${activePartNumber}`;
      });
    }

    if (editChapterPartButton && activeChapter && activePartNumber) {
      editChapterPartButton.addEventListener("click", async () => {
        await openEditPartModal(book.id, activeChapter.number, activePartNumber, book, activeChapter);
      });
    }

    if (createChapterPartAudioButton && activeChapter && activePartNumber) {
      createChapterPartAudioButton.addEventListener("click", async () => {
        await createChapterPartAudio(book, activeChapter, activePartNumber);
      });
    }

    if (playAudioButton && audioPlayer && activeChapter && activePart) {
      playAudioButton.addEventListener("click", async () => {
        audioPlayer.src = `/api/book/${this.book.id}/chapter/${activeChapter.number}/part/${activePartNumber}/audio`;
        audioPlayer.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      });
    }
    if (pauseAudioButton && audioPlayer) {
      pauseAudioButton.addEventListener("click", () => {
        audioPlayer.pause();
      });
    }
    if (audioPlayer && playAudioButton && pauseAudioButton) {
      audioPlayer.addEventListener("play", () => {
        playAudioButton.style.display = "none";
        pauseAudioButton.style.display = "inline-block";
      });
      audioPlayer.addEventListener("pause", () => {
        playAudioButton.style.display = "inline-block";
        pauseAudioButton.style.display = "none";
      });
      audioPlayer.addEventListener("ended", () => {
        playAudioButton.style.display = "inline-block";
        pauseAudioButton.style.display = "none";
      });
    }

    if (addChapterButton) {
      addChapterButton.addEventListener("click", async () => {
        const chapter = await addChapter(book);
        window.location.pathname = `/book/${book.id}/chapter/${chapter.number}`;
      });
    }

    if (downloadAudioButton) {
      downloadAudioButton.addEventListener("click", async () => {
        await downloadFullAudio(book);
      });
    }

    if (deleteBookButton) {
      deleteBookButton.addEventListener("click", async () => {
        createModal(
          "Delete Book",
          "Delete",
          [
            {
              name: "are_you_sure",
              type: "paragraph",
              text: "Are you sure you want to permanently delete this book?",
            },
          ],
          this.handleDeleteBookModalSubmit.bind(this),
        );
      });
    }

    if (downloadBookButton) {
      downloadBookButton.addEventListener("click", async () => {
        openDownloadBookModal(book);
      });
    }

    if (createBookEverythingButton) {
      createBookEverythingButton.addEventListener("click", () => {
        createModal(
          "Generate Everything for Book",
          "Generate",
          [
            {
              name: "maxSpend",
              label: "Maximum Spend ($)",
              type: "number",
              default: "1",
            },
          ],
          async (result) => {
            const maxSpend = parseFloat(
              result.find((r) => r.name === "maxSpend")?.value as string,
            );
            await generateEverythingApi(book.id, maxSpend);
            window.location.reload();
          },
        );
      });
    }

    if (createChapterEverythingButton) {
      createChapterEverythingButton.addEventListener("click", () => {
        createModal(
          "Generate Everything for Chapter",
          "Generate",
          [
            {
              name: "confirm",
              type: "paragraph",
              text: `This will generate the outline${activeChapter!.outline.length === 0 ? "" : " (already exists)"}, parts${activeChapter!.parts.length === 0 ? "" : " (already exists)"}, and audio${activeChapter!.parts.length > 0 && activeChapter!.parts[0].audio ? " (already exists)" : ""} for this chapter. Continue?`,
            },
          ],
          async () => {
            if (activeChapter && activeChapter!.outline.length === 0) {
              await createChapterOutline(book, activeChapter!);
            }
            if (activeChapter && activeChapter!.parts.length === 0) {
              activeChapter.parts = await createChapter(book, activeChapter!);
            }
            if (
              activeChapter &&
              activeChapter!.parts.length > 0 &&
              !activeChapter!.parts[0].audio
            ) {
              await createChapterAudio(book, activeChapter!);
            }
            window.location.pathname = `/book/${book.id}/chapter/${activeChapter!.number}`;
          },
        );
      });
    }

    const textareas: NodeListOf<HTMLTextAreaElement> =
      document.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      if (textarea) {
        textarea.addEventListener("input", () => {
          this.handleChange(textarea);
        });
      }
    });

    await this.pronunciationsComponent.addEventListeners();
    await this.referencesComponent.addEventListeners();
    await this.charactersComponent.addEventListeners();

    const generateInstructionsButtons = document.querySelectorAll(
      ".generate-instructions",
    );
    generateInstructionsButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const property = button.getAttribute("data-property");
        if (property) {
          generateProperty(this.book, property);
        }
      });
    });

    const inputs: NodeListOf<HTMLInputElement> =
      document.querySelectorAll("input");
    inputs.forEach((input) => {
      if (input) {
        input.addEventListener("input", () => {
          this.handleChange(input);
        });
      }
    });

    setInterval(async () => {
      if (this.hasChanges) {
        await fetch(`/api/book/${this.book.id}/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.book),
        });
        this.hasChanges = false;
        const saveStatus = document.querySelector(".save-status");
        if (saveStatus) {
          saveStatus.innerHTML = "Saved";
        }
      }
    }, 2000);
  }

  async handleDeleteBookModalSubmit(): Promise<void> {
    await fetch(`/api/book/${this.book.id}`, {
      method: "DELETE",
    });
    window.location.pathname = `/`;
  }

  handleChange(elem: HTMLTextAreaElement | HTMLInputElement): void {
    const attributes = elem.name.split(/[\.\[\]]/).filter(at => !!at);
    const first = attributes.shift();

    if (first === "book") {
      const book = this[first];
      updateNestedProperty(book, attributes, elem.value);
    } else if (first === "activeChapter") {
      const activeChapter = this[first];
      const integerAttributes = [ 'partLength', 'maxParts', 'minParts' ];
      const isIntegerAttribute = integerAttributes.includes(attributes[attributes.length - 1]);
      updateNestedProperty(activeChapter, attributes, isIntegerAttribute ? parseInt(elem.value) : elem.value);
    } else if (first === "activePart") {
      const activePart = this[first];
      updateNestedProperty(activePart, attributes, elem.value);
    }

    this.hasChanges = true;
    const saveStatus = document.querySelector(".save-status");
    if (saveStatus) {
      saveStatus.innerHTML = "Saving";
    }
  }
}

function updateNestedProperty(
  obj: unknown,
  properties: string[],
  value: unknown,
): void {
  let current = obj as Record<string, unknown>;

  for (let i = 0; i < properties.length - 1; i++) {
    const prop = properties[i];
    if (
      !(prop in current) ||
      typeof current[prop] !== "object" ||
      current[prop] === null
    ) {
      throw new Error(`Property '${prop}' does not exist or is not an object`);
    }
    current = current[prop] as Record<string, unknown>;
  }

  const lastProp = properties[properties.length - 1];
  if (!(lastProp in current)) {
    throw new Error(`Property '${lastProp}' does not exist`);
  }

  current[lastProp] = value;
}
