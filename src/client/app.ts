import { Book, BookId, Chapter } from '../types/book.type.js';
import { bookPage } from './page.book.js';
import { homePage } from './page.home.js';
import { page404 } from './page.404.js';
import '/example.js';

class ClientApp {
    rootElementId: string;
    books: BookId[] = [];
    bookId?: BookId;
    book?: Book;
    chapter?: Chapter;

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
        let page = page404();
        let pageName: string = "";

        if (location.pathname === "/") {
            pageName = "home";
            page = await this.homePageRouter();
        } if (location.pathname.match(/^\/book\/([^\/]+)\/chapter\/([^\/]+)/)) {
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
                ${page}
            </div>
        `
    }

    async homePageRouter() {
        this.book = undefined;
        this.chapter = undefined;
        return homePage(this.books);
    }

    async bookPageRouter() {
        this.chapter = undefined;
        await this.getBookFromRoute();
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
        return bookPage(this.books, book);
    }

    async chapterPageRouter() {
        await this.getBookFromRoute();
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
        await this.getChapterFromRoute();
        const chapter = this.chapter;
        if (!book) throw new Error("Chapter not loaded");
        return bookPage(this.books, book, chapter);
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
        if (!matches || matches.length < 2) throw new Error('Match not found');
        const chapterIndex = parseInt(matches[2]) - 1;
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
        this.chapter = book.chapters[chapterIndex];
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
