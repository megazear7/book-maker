import { Book } from "../types/book.type.js";
import { Component } from "./component.interface.js";

export class CompletionBar implements Component {
    book: Book;

    constructor(book: Book) {
        this.book = book;
    }

    render() {
        const book = this.book;
        let completionBar = '';
        if (book.chapters && book.chapters.length > 0) {
            completionBar = '<div class="completion-bar">';
            book.chapters.forEach((chapter, chapterIdx) => {
                let expectedParts = chapter.maxParts || chapter.minParts || chapter.parts.length;
                if (typeof expectedParts !== 'number' || expectedParts < chapter.parts.length) {
                    expectedParts = chapter.parts.length;
                }
                completionBar += `<div class="completion-bar-chapter">`;
                completionBar += `<a href="/book/${book.id}/chapter/${chapter.number}" class="completion-bar-chapter-label">Chapter ${chapter.number}</a>`;
                completionBar += '<div class="completion-bar-parts">';
                for (let idx = 0; idx < expectedParts; idx++) {
                    const part = chapter.parts[idx];
                    const written = part && part.text && part.text.trim().length > 0;
                    const audio = part && !!part.audio;
                    const isEmpty = !part;
                    const msg = written && audio ? 'is written and has audio' : written ? 'is written' : audio ? 'has audio' : 'is not yet written';
                    let partClass = 'completion-bar-segment';
                    if (isEmpty) partClass += ' empty';
                    else if (written && audio) partClass += ' written-audio';
                    else if (written) partClass += ' written';
                    else if (audio) partClass += ' audio';
                    completionBar += `<div title="Chapter ${chapter.number} part ${idx + 1} ${msg}" class="${partClass}"><span class="completion-bar-segment-label">${idx + 1}</span></div>`;
                }
                completionBar += '</div>';
                completionBar += '</div>';
            });
            completionBar += '</div>';
        }

        return completionBar;
    }

    async addEventListeners(): Promise<void> {
    }
}
