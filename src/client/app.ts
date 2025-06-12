import { Book, BookId } from '../types/book.type.js';
import { bookPage } from './page.book.js';
import { homePage } from './page.home.js';
import { page404 } from './page.404.js';
import '/example.js';

class ClientApp {
    rootElementId: string;
    books: BookId[] = [];
    bookId?: BookId;
    book?: Book;

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

        if (location.pathname === "/") {
            page = await this.homePageRouter();
        } else if (location.pathname.match(/^\/book\/([^\/]+)$/)) {
            page = await this.bookPageRouter();
        }

        this.root.innerHTML = `
            <ul>
                <li><a href="/">Home</a></li>
                ${this.books.map(bookId => `
                    <li><a href="/book/${bookId}">${bookId}</a></li>
                `)}
            </ul>

            ${page}
        `
    }

    async homePageRouter() {
        return homePage(this.books);
    }

    async bookPageRouter() {
        const matches = location.pathname.match(/^\/book\/([^\/]+)$/);
        if (!matches || matches.length < 1) throw new Error('Match not found');
        this.bookId = matches[1];
        await this.loadBook();
        const book = this.book;
        if (!book) throw new Error("Book not loaded");
        return bookPage(this.books, book);
    }
}

const app = new ClientApp("app");
app.init();
