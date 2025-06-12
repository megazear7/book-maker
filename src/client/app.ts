import { Book, BookId } from '../types/book.type';
import '/example.js';

class ClientApp {
    rootElementId: string;
    books: BookId[] = [];
    book?: Book;

    constructor(rootElementId: string) {
        this.rootElementId = rootElementId;
    };

    async init() {
        await this.loadBooks();
        this.render();
    }

    async loadBooks() {
        this.books = await (await fetch('/api/books')).json()
    }

    get root(): HTMLElement {
        const element = document.getElementById(this.rootElementId);
        if (!element) throw new Error("Root element id not found: " + this.rootElementId);
        return element;
    }

    render() {
        this.root.innerHTML = `
            <h1>Hello from app</h1>
        `
    }
}

const app = new ClientApp("app");
app.init();
