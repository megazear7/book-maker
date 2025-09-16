import { Book, Chapter, ChapterPart, ChapterPartNumber } from "../types/book.type.js";
import { CompletionBar } from "./component.completion-bar.js";
import { download } from "./download.js";
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { aiIconLeft, aiIconRight, audioIcon, downloadIcon, plusIcon, trashIcon } from "./icon.js";
import { createModal } from "./modal.js";
import { Page } from "./page.interface.js";
import { addChapter, createChapter, createChapterAudio, createChapterOutline, createChapterPart, createChapterPartAudio, downloadFullAudio } from "./service.js";
import { formatNumber } from "./util.js";

export class BookPage implements Page {
  book: Book;
  activeChapter?: Chapter;
  activePart?: ChapterPart;
  activePartNumber?: ChapterPartNumber;
  hasChanges: boolean = false;

  constructor(book: Book, activeChapter?: Chapter, activePart?: ChapterPart, activePartNumber?: ChapterPartNumber) {
    this.book = book;
    this.activeChapter = activeChapter;
    this.activePart = activePart;
    this.activePartNumber = activePartNumber;
  }

  render(root: HTMLElement) {
    const book = this.book;
    const activeChapter = this.activeChapter;
    const activePart = this.activePart;
    const activePartNumber = this.activePartNumber;
    const million = 1000000;
    const tokens = formatNumber(book.model.text.usage.completion_tokens + book.model.text.usage.prompt_tokens);
    const cost = formatNumber(book.model.text.usage.completion_tokens * (book.model.text.cost.outputTokenCost / million) +
      book.model.text.usage.prompt_tokens * (book.model.text.cost.inputTokenCost / million), { decimals: 2 });
    const wordCount = formatNumber(book.chapters.map(chapter => chapter.parts.map(part => part.text).join(' ')).join(' ').split(/\s+/).length);
    const usage = `${tokens} tokens&nbsp;&nbsp;&nbsp;&nbsp;$${cost}&nbsp;&nbsp;&nbsp;&nbsp;${wordCount} words`;

    root.innerHTML = `
        ${new CompletionBar(book).render()}
        <div class="spread">
          <div>
            <button id="download-book" class="secondary">${downloadIcon} Download Book</button>
            <button id="download-audio" class="secondary">${downloadIcon} Download Audio</button>
          </div>

          <div>
            <button id="delete-book" class="tertiary warning">${trashIcon} Delete Book</button>
          </div>
        </div>
        <div data-section="book" class="secondary-surface">
            <input name="book.title" value="${book.title}" class="h1"></textarea>
            <div class="spread">
              <span>${usage}</span>
              <span class="save-status">${this.hasChanges ? "Saving" : "Saved"}</span>
            </div>
            <h4>Edit Instructions</h4>
            <textarea name="book.instructions.edit">${book.instructions.edit}</textarea>
        </div>

        <div class="secondary-surface">
            <h4>Audio Instructions</h4>
            <textarea name="book.instructions.audio">${book.instructions.audio}</textarea>
        </div>

        <ul class="pills">
            ${book.chapters
        .map(
          (chapter) => `
                <li class="${chapter.number === activeChapter?.number ? "active" : ""}"><a href="/book/${book.id}/chapter/${chapter.number}">Chapter ${chapter.number}: ${chapter.title}</a></li>
            `,
        )
        .join("")}
            <li><button class="clean" id="add-chapter">${plusIcon}Add Chapter</button>
        </ul>

        ${activeChapter
        ? `
            <div data-section="chapter" data-scroll-priority="1"></div>
            <div class="secondary-surface">
                <h4 >Chapter ${activeChapter.number}</h4>
                <h2><input name="activeChapter.title" class="h2" value="${activeChapter.title}"></input></h2>
            </div>

            <div class="secondary-surface">
                <h4>When</h4>
                <textarea name="activeChapter.when">${activeChapter.when}</textarea>

                <h4>Where</h4>
                <textarea name="activeChapter.where">${activeChapter.where}</textarea>

                <h4>What</h4>
                <textarea name="activeChapter.what">${activeChapter.what}</textarea>

                <h4>Why</h4>
                <textarea name="activeChapter.why">${activeChapter.why}</textarea>

                <h4>How</h4>
                <textarea name="activeChapter.how">${activeChapter.how}</textarea>

                <h4>Who</h4>
                <textarea name="activeChapter.who">${activeChapter.who}</textarea>
            </div>

            <div class="secondary-surface">
                <h4>Minimum Parts</h4>
                <input name="activeChapter.minParts" type="text" value="${activeChapter.minParts}"></input>

                <h4>Maximum Parts</h4>
                <input name="activeChapter.maxParts" type="text" value="${activeChapter.maxParts}"></input>

                <h4>Estimated Part Length in Words</h4>
                <input name="activeChapter.partLength" type="text" value="${activeChapter.partLength}"></input>
            </div>

            <button id="create-chapter-outline">${aiIconLeft}<span>${activeChapter.outline.length > 0 ? "Regenerate" : "Generate"} Outline</span>${aiIconRight}</button>
            <button id="create-chapter">${aiIconLeft}<span>${activeChapter.parts.length > 0 ? "Regenerate" : "Generate"} Chapter</span>${aiIconRight}</button>
            <button id="create-chapter-audio">${aiIconLeft}<span>${activeChapter.parts[0]?.audio ? "Regenerate" : "Generate"} Audio</span>${aiIconRight}</button>

            ${activeChapter.outline
          ? `
                <div class="secondary-surface">
                    <h4>Chapter Outline</h4>
                    ${activeChapter.outline
            .map(
              (partDescription, index) => `
                        <h5>Part ${index + 1}</h5>
                        <textarea name="activeChapter.outline[index]">${partDescription}</textarea>
                    `,
            )
            .join("")}
                </div>
            `
          : ""
        }

            ${activeChapter.parts.length > 0
          ? `
                <ul data-section="part" data-scroll-priority="${activePart ? 2 : 0}" class="pills">
                    ${activeChapter.parts
            .map(
              (part, index) => `
                        <li class="${activePartNumber && index === activePartNumber - 1 ? 'active' : ''}"><a href="/book/${book.id}/chapter/${activeChapter.number}/part/${index + 1}">Part ${index + 1}</a></li>
                    `,
            )
            .join("")}
                </ul>
            `
          : `
            `
        }

            ${activePart
          ? `
                <button id="create-chapter-part">${aiIconLeft}<span>${activeChapter.parts.length > 0 ? "Regenerate" : "Generate"} Part</span>${aiIconRight}</button>
                ${activePart.audio ? `
                  <button id="create-chapter-part-audio">${aiIconLeft}<span>${activeChapter.parts.length > 0 ? "Regenerate" : "Generate"} Audio</span>${aiIconRight}</button>
                  <audio id="audio-player"></audio>
                `: ''}

                <div class="secondary-surface">
                    <div>
                      ${activePart.audio ? `
                        <button class="secondary audio-button" id="play-audio" style="display:inline-block;">${audioIcon} Play Audio</button>
                        <button class="secondary audio-button" id="pause-audio" style="display:none;">⏸ Pause Audio</button>
                      `: ''}
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

  async addEventListeners() {
    const createChapterOutlineButton = document.getElementById(
      "create-chapter-outline",
    );
    const addChapterButton = document.getElementById("add-chapter");
    const createChapterButton = document.getElementById("create-chapter");
    const createChapterAudioButton = document.getElementById("create-chapter-audio");
    const createChapterPartButton = document.getElementById("create-chapter-part");
    const createChapterPartAudioButton = document.getElementById("create-chapter-part-audio");
    const audioPlayer = document.getElementById("audio-player") as HTMLAudioElement;
    const playAudioButton = document.getElementById("play-audio");
    const pauseAudioButton = document.getElementById("pause-audio");
    const downloadBookButton = document.getElementById("download-book");
    const downloadAudioButton = document.getElementById("download-audio");
    const deleteBookButton = document.getElementById("delete-book");
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

    if (createChapterPartAudioButton && activeChapter && activePartNumber) {
      createChapterPartAudioButton.addEventListener("click", async () => {
        await createChapterPartAudio(book, activeChapter, activePartNumber);
      });
    }

    if (playAudioButton && audioPlayer && activeChapter && activePart) {
      playAudioButton.addEventListener("click", async () => {
        audioPlayer.src = `/api/book/${this.book.id}/chapter/${activeChapter.number}/part/${activePartNumber}/audio`;
        audioPlayer.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      });
    }
    if (pauseAudioButton && audioPlayer) {
      pauseAudioButton.addEventListener("click", () => {
        audioPlayer.pause();
      });
    }
    if (audioPlayer && playAudioButton && pauseAudioButton) {
      audioPlayer.addEventListener('play', () => {
        playAudioButton.style.display = 'none';
        pauseAudioButton.style.display = 'inline-block';
      });
      audioPlayer.addEventListener('pause', () => {
        playAudioButton.style.display = 'inline-block';
        pauseAudioButton.style.display = 'none';
      });
      audioPlayer.addEventListener('ended', () => {
        playAudioButton.style.display = 'inline-block';
        pauseAudioButton.style.display = 'none';
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
        createModal("Delete Book", "Delete", [{
          name: 'are_you_sure',
          type: 'paragraph',
          text: 'Are you sure you want to permanently delete this book?'
        }], this.handleDeleteBookModalSubmit.bind(this));
      });
    }

    if (downloadBookButton) {
      downloadBookButton.addEventListener("click", async () => {
        createModal(
          "Download Book",
          "Download",
          [
            {
              name: "format",
              label: "File Format",
              type: "dropdown",
              options: [
                { label: "MS Word", value: "docx" },
                { label: "Plain Text", value: "txt" }
              ],
              default: "docx"
            }
          ],
          async (result) => {
            const format = result.find((r) => r.name === "format")?.value || "txt";
            if (format === "txt") {
              const bookText = book.chapters
                .map(chapter => {
                  const text = chapter.parts.map(part => part.text).join('\n');
                  return `Chapter ${chapter.number}: ${chapter.title}\n\n${text || 'Not written yet'}`;
                })
                .join('\n\n\n');
              download(bookText, `${book.id}.txt`);
            } else if (format === "docx") {
              const doc = new Document({
                sections: [
                  {
                    children: book.chapters.flatMap(chapter => [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `Chapter ${chapter.number}: ${chapter.title}`, bold: true, size: 28 }),
                        ],
                        spacing: { after: 200 },
                      }),
                      ...chapter.parts.map(part =>
                        new Paragraph({
                          children: [
                            new TextRun({ text: part.text || '', size: 24 }),
                          ],
                          spacing: { after: 100 },
                        })
                      ),
                      new Paragraph({ text: '' })
                    ])
                  }
                ]
              });
              Packer.toBlob(doc).then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${book.id}.docx`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, 100);
              });
            }
          }
        );
      });
    }

    const textareas: NodeListOf<HTMLTextAreaElement> = document.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      if (textarea) {
        textarea.addEventListener("input", () => {
          this.handleChange(textarea);
        });
      }
    });

    const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll("input");
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
            'Content-Type': 'application/json',
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

  async handleDeleteBookModalSubmit() {
    await fetch(`/api/book/${this.book.id}`, {
      method: "DELETE"
    });
    window.location.pathname = `/`;
  }

  handleChange(elem: HTMLTextAreaElement | HTMLInputElement) {
    const attributes = elem.name.split('.');
    const first = attributes.shift();

    if (first === "book") {
      const book = this[first];
      updateNestedProperty(book, attributes, elem.value);
    } else if (first === "activeChapter") {
      const activeChapter = this[first];
      updateNestedProperty(activeChapter, attributes, elem.value);
    } else if (first === "activePart") {
      const activePart = this[first];
      updateNestedProperty(activePart, attributes, elem.value);
    } else {
      throw new Error("Invalid first item");
    }

    this.hasChanges = true;
    const saveStatus = document.querySelector(".save-status");
    if (saveStatus) {
      saveStatus.innerHTML = "Saving";
    }
  }
}

function updateNestedProperty(obj: any, properties: string[], value: any): void {
  let current: any = obj;

  for (let i = 0; i < properties.length - 1; i++) {
    const prop = properties[i];
    if (!(prop in current) || typeof current[prop] !== 'object' || current[prop] === null) {
      throw new Error(`Property '${prop}' does not exist or is not an object`);
    }
    current = current[prop];
  }

  const lastProp = properties[properties.length - 1];
  if (!(lastProp in current)) {
    throw new Error(`Property '${lastProp}' does not exist`);
  }

  current[lastProp] = value;
}
