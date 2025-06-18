import { Book, Chapter, ChapterPart } from "../types/book.type.js";
import { aiIconLeft, aiIconRight } from "./icon.js";
import { Page } from "./page.interface.js";
import { createChapterOutline } from "./service.js";

export class BookPage implements Page {
    book: Book;
    activeChapter?: Chapter;
    activePart?: ChapterPart;

    constructor(book: Book, activeChapter?: Chapter, activePart?: ChapterPart) {
        this.book = book;
        this.activeChapter = activeChapter;
        this.activePart = activePart;
    }

    render(root: HTMLElement) {
        const book = this.book;
        const activeChapter = this.activeChapter;
        const activePart = this.activePart;
        root.innerHTML = `
        <div class="secondary-surface">
            <h1>${book.title}</h1>
        </div>

        <div class="secondary-surface">
            <h4>Overview</h4>
            <textarea>${book.overview}</textarea>
        </div>

        <div class="secondary-surface">
            <h4>Edit Instructions</h4>
            <textarea>${book.instructions.edit}</textarea>
        </div>

        <div class="secondary-surface">
            <h4>Audio Instructions</h4>
            <textarea>${book.instructions.audio}</textarea>
        </div>

        <ul class="pills">
            ${book.chapters.map(chapter => `
                <li class="${chapter.number === activeChapter?.number ? 'active' : ''}"><a href="/book/${book.id}/chapter/${chapter.number}">Chapter ${chapter.number}: ${chapter.title}</a></li>
            `).join('')}
        </ul>

        ${activeChapter ? `
            <div class="secondary-surface">
                <h4>Chapter ${activeChapter.number}</h4>
                <h2><textarea class="h2">${activeChapter.title}</textarea></h2>
            </div>

            <div class="secondary-surface">
                <h4>When</h4>
                <textarea class="small">${activeChapter.when}</textarea>

                <h4>Where</h4>
                <textarea class="small">${activeChapter.where}</textarea>

                <h4>What</h4>
                <textarea class="small">${activeChapter.what}</textarea>

                <h4>Why</h4>
                <textarea class="small">${activeChapter.why}</textarea>

                <h4>How</h4>
                <textarea class="small">${activeChapter.how}</textarea>

                <h4>Who</h4>
                <textarea class="small">${activeChapter.who}</textarea>
            </div>

            <div class="secondary-surface">
                <h4>Minimum Parts</h4>
                <input type="text" value="${activeChapter.minParts}"></input>

                <h4>Maximum Parts</h4>
                <input type="text" value="${activeChapter.maxParts}"></input>

                <h4>Estimated Part Length in Words</h4>
                <input type="text" value="${activeChapter.partLength}"></input>
            </div>

            ${ activeChapter.parts.length > 0 ? `
                <ul class="pills">
                    ${activeChapter.parts.map((part, index) => `
                        <li><a href="/book/${book.id}/chapter/${activeChapter.number}/part/${index}">Part ${index}: ${part.outline}</a></li>
                    `).join('')}
                </ul>
            ` : `
                <button id="create-chapter-outline">${aiIconLeft}<span>Create Chapter Outline</span>${aiIconRight}</button>
            `}

            ${activePart ? `
                <div class="secondary-surface">
                    <h4>Chapter Part Outline</h4>
                    <textarea>${activePart.created}</textarea>
                </div>

                <div class="secondary-surface">
                    <h4>Created Part Text</h4>
                    <textarea>${activePart.created}</textarea>
                </div>
            `: ''}

            <div class="secondary-surface">
                <h4>Chapter Text</h4>
                <textarea>${activeChapter.created}</textarea>
            </div>
        `: ''}
        `
    }

    async addEventListeners() {
        const createChapterOutlineButton = document.getElementById("create-chapter-outline");
        const book = this.book;
        const activeChapter = this.activeChapter;
        const activePart = this.activePart;

        if (createChapterOutlineButton && activeChapter) {
            createChapterOutlineButton.addEventListener('click', async () => {
                const result = await createChapterOutline(book.id, activeChapter?.number);
                console.log(result);
            });
        } else {
            throw new Error("Create chapter outline button not found");
        }
    }
}
