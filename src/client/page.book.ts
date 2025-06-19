import { Book, Chapter, ChapterPart } from "../types/book.type.js";
import { aiIconLeft, aiIconRight } from "./icon.js";
import { Page } from "./page.interface.js";
import { createChapter, createChapterOutline } from "./service.js";

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
            <textarea class="h1">${book.title}</textarea>
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
                <textarea>${activeChapter.when}</textarea>

                <h4>Where</h4>
                <textarea>${activeChapter.where}</textarea>

                <h4>What</h4>
                <textarea>${activeChapter.what}</textarea>

                <h4>Why</h4>
                <textarea>${activeChapter.why}</textarea>

                <h4>How</h4>
                <textarea>${activeChapter.how}</textarea>

                <h4>Who</h4>
                <textarea>${activeChapter.who}</textarea>
            </div>

            <div class="secondary-surface">
                <h4>Minimum Parts</h4>
                <input type="text" value="${activeChapter.minParts}"></input>

                <h4>Maximum Parts</h4>
                <input type="text" value="${activeChapter.maxParts}"></input>

                <h4>Estimated Part Length in Words</h4>
                <input type="text" value="${activeChapter.partLength}"></input>
            </div>

            <button id="create-chapter-outline">${aiIconLeft}<span>${activeChapter.outline.length > 0 ? 'Regenerate' : 'Generate'} Chapter Outline</span>${aiIconRight}</button>

            ${activeChapter.outline ? `
                <div class="secondary-surface">
                    <h4>Chapter Outline</h4>
                    ${activeChapter.outline.map((partDescription, index) => `
                        <h5>Part ${index+1}</h5>
                        <textarea>${partDescription}</textarea>
                    `).join('')}
                </div>
            `: ''}

            ${ activeChapter.parts.length > 0 ? `
                <ul class="pills">
                    ${activeChapter.parts.map((part, index) => `
                        <li><a href="/book/${book.id}/chapter/${activeChapter.number}/part/${index+1}">Part ${index+1}</a></li>
                    `).join('')}
                </ul>
            ` : `
            `}

            ${ activePart ? `
                <div class="secondary-surface">
                    <textarea>${activePart.text}</textarea>
                </div>
            `: ''}

            <button id="create-chapter">${aiIconLeft}<span>${activeChapter.parts.length > 0 ? 'Regenerate' : 'Generate'} Chapter</span>${aiIconRight}</button>
        `: ''}
        `
    }

    async addEventListeners() {
        const createChapterOutlineButton = document.getElementById("create-chapter-outline");
        const createChapterButton = document.getElementById("create-chapter");
        const book = this.book;
        const activeChapter = this.activeChapter;

        if (createChapterOutlineButton && activeChapter) {
            createChapterOutlineButton.addEventListener('click', async () => {
                await createChapterOutline(book.id, activeChapter?.number);
                window.location.pathname = `/book/${book.id}/chapter/${activeChapter.number}`;
            });
        }

        if (createChapterButton && activeChapter) {
            createChapterButton.addEventListener('click', async () => {
                await createChapter(book.id, activeChapter?.number);
                window.location.pathname = `/book/${book.id}/chapter/${activeChapter.number}`;
            });
        }
    }
}
