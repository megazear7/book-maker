import { Book, BookId, Chapter, ChapterPart } from '../types/book.type.js';
import { BookPage } from './page.book.js';
import { HomePage } from './page.home.js';
import { Page404 } from './page.404.js';
import '/example.js';
import { Page } from './page.interface.js';

class ClientApp {
    rootElementId: string;
    books: BookId[] = [];
    bookId?: BookId;
    book?: Book;
    chapter?: Chapter;
    part?: ChapterPart;

    constructor(rootElementId: string) {
        this.rootElementId = rootElementId;
    };

    async init() {
        await this.loadBooks();
        this.render();
    }

    async loadBooks() {
        this.books = BookId.array().parse(await (await fetch('/api/books')).json());
    }

    async loadBook() {
        this.book = Book.parse(await (await fetch(`/api/book/${this.bookId}`)).json());
    }

    get root(): HTMLElement {
        const element = document.getElementById(this.rootElementId);
        if (!element) throw new Error("Root element id not found: " + this.rootElementId);
        return element;
    }

    async render() {
        let page: Page = new Page404();
        let pageName: string = "";

        if (location.pathname === "/") {
            pageName = "home";
            page = await this.homePageRouter();
        } else if (location.pathname.match(/^\/book\/([^\/]+)\/chapter\/([^\/]+)\/part\/([^\/]+)/)) {
            pageName = "book";
            page = await this.partPageRouter();
        } else if (location.pathname.match(/^\/book\/([^\/]+)\/chapter\/([^\/]+)/)) {
            pageName = "book";
            page = await this.chapterPageRouter();
        } else if (location.pathname.match(/^\/book\/([^\/]+)/)) {
            pageName = "chapter";
            page = await this.bookPageRouter();
        }

        this.root.innerHTML = `
            <div class="container">
                <ul class="pills">
                    <li class="${pageName === 'home'}">
                        <a href="/">Home</a>
                    </li>
                    ${this.books.map(bookId => `
                        <li class="${bookId === this.book?.id ? 'active' : ''}">
                            <a href="/book/${bookId}">${bookId}</a>
                        </li>
                    `).join('')}
                </ul>
                <div id="page"></div>
                ${page}
            </div>
        `;

        const pageRoot = document.getElementById("page");
        if (pageRoot) {
            page.render(pageRoot);
            page.addEventListeners();
        }

        this.resizeTextAreas();
    }

    resizeTextAreas() {
        const textareas: NodeListOf<HTMLTextAreaElement> = document.querySelectorAll('textarea');

        const resizeTextarea = (element: HTMLTextAreaElement) => {
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
        };

        textareas.forEach(textarea => {
            if (textarea) {
                textarea.addEventListener('input', () => resizeTextarea(textarea));
                window.addEventListener('load', () => resizeTextarea(textarea));
            }
        });
    }

    async homePageRouter(): Promise<Page> {
        this.book = undefined;
        this.chapter = undefined;
        return new HomePage();
    }

    async bookPageRouter(): Promise<Page> {
        this.chapter = undefined;
        await this.getBookFromRoute();
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
        return new BookPage(book);
    }

    async partPageRouter(): Promise<Page> {
        await this.getBookFromRoute();
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
        await this.getChapterFromRoute();
        const chapter = this.chapter;
        if (!book) throw new Error("Chapter not loaded");
        await this.getPartFromRoute();
        const part = this.part;
        if (!part) throw new Error("Part not loaded");
        return new BookPage(book, chapter, part);
    }

    async chapterPageRouter(): Promise<Page> {
        await this.getBookFromRoute();
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
        await this.getChapterFromRoute();
        const chapter = this.chapter;
        if (!book) throw new Error("Chapter not loaded");
        return new BookPage(book, chapter);
    }

    async getBookFromRoute() {
        const matches = location.pathname.match(/^\/book\/([^\/]+)/);
        if (!matches || matches.length < 1) throw new Error('Match not found');
        this.bookId = matches[1];
        await this.loadBook();
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
    }

    async getChapterFromRoute() {
        const matches = location.pathname.match(/^\/book\/([^\/]+)\/chapter\/([^\/]+)/);
        if (!matches || matches.length < 3) throw new Error('Match not found');
        const chapterIndex = parseInt(matches[2]) - 1;
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
        this.chapter = book.chapters[chapterIndex];
    }

    async getPartFromRoute() {
        const matches = location.pathname.match(/^\/book\/([^\/]+)\/chapter\/([^\/]+)\/part\/([^\/]+)/);
        if (!matches || matches.length < 4) throw new Error('Match not found');
        const chapterIndex = parseInt(matches[2]) - 1;
        const partIndex = parseInt(matches[3]) - 1;
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
        const chapter = book.chapters[chapterIndex];
        if (!chapter) throw new Error("Chapter not found");
        this.part = chapter.parts[partIndex];
    }
}

const app = new ClientApp("app");
app.init();

// Function to handle navigation
function navigate(event: Event) {
    const target = event.target as HTMLElement;
    const anchor = target as HTMLAnchorElement;
    if (target.tagName === 'A' && anchor.href) {
        event.preventDefault();
        const url = new URL(anchor.href);
        const path = url.pathname;
        window.history.pushState({}, '', path);
        app.render();
    }
}

// Add event listener to capture all clicks on links
document.addEventListener('click', navigate);
