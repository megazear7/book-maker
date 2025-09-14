import {
  Book,
  BookId,
  BookMinimalInfo,
  Chapter,
  ChapterPart,
  ChapterPartNumber,
} from "../types/book.type.js";
import { BookPage } from "./page.book.js";
import { HomePage } from "./page.home.js";
import { Page404 } from "./page.404.js";
import "/example.js";
import { Page } from "./page.interface.js";
import { plusIcon } from "./icon.js";
import { addEmptyBook, createBook } from "./service.js";
import { createModal, getExpectedBooleanValue, getExpectedNumberValue, getExpectedStringValue, ModalSubmitDetail } from "./modal.js";

class ClientApp {
  rootElementId: string;
  books: BookMinimalInfo[] = [];
  bookId?: BookId;
  book?: Book;
  chapter?: Chapter;
  part?: ChapterPart;
  partNumber?: ChapterPartNumber;

  constructor(rootElementId: string) {
    this.rootElementId = rootElementId;
  }

  async init() {
    await this.loadBooks();
    this.render();
  }

  async loadBooks() {
    this.books = BookMinimalInfo.array().parse(
      await (await fetch("/api/books")).json(),
    );
  }

  async loadBook() {
    this.book = Book.parse(
      await (await fetch(`/api/book/${this.bookId}`)).json(),
    );
  }

  get root(): HTMLElement {
    const element = document.getElementById(this.rootElementId);
    if (!element)
      throw new Error("Root element id not found: " + this.rootElementId);
    return element;
  }

  async render() {
    let page: Page = new Page404();
    let pageName: string = "";

    if (location.pathname === "/") {
      pageName = "home";
      page = await this.homePageRouter();
    } else if (
      location.pathname.match(
        /^\/book\/([^\/]+)\/chapter\/([^\/]+)\/part\/([^\/]+)/,
      )
    ) {
      pageName = "book";
      page = await this.partPageRouter();
    } else if (
      location.pathname.match(/^\/book\/([^\/]+)\/chapter\/([^\/]+)/)
    ) {
      pageName = "book";
      page = await this.chapterPageRouter();
    } else if (location.pathname.match(/^\/book\/([^\/]+)/)) {
      pageName = "chapter";
      page = await this.bookPageRouter();
    }

    this.root.innerHTML = `
      <div class="bookmark-tabs">
        <div class="bookmark-tab" data-tab="book">Book</div>
        <div class="bookmark-tab" data-tab="chapter">Chapter</div>
        <div class="bookmark-tab" data-tab="part">Part</div>
      </div>
      <div class="container">
        <ul class="pills">
          <li class="${pageName === "home"}">
            <a href="/">Home</a>
          </li>
          ${this.books
            .map(
              (book) => `
                <li class="${book.id === this.book?.id ? "active" : ""}">
                  <a href="/book/${book.id}">${book.title}</a>
                </li>
              `,
            )
            .join("")}
          <li>
            <button class="clean" id="new-book">${plusIcon}New Book</button>
          </li>
        </ul>
        <div id="page"></div>
      </div>
    `;

    const pageRoot = document.getElementById("page");
    if (pageRoot) {
      page.render(pageRoot);
      page.addEventListeners();
    }

    // Bookmark tab highlight logic
    setTimeout(() => {
      const tabs = Array.from(document.querySelectorAll('.bookmark-tab')) as HTMLElement[];
      const bookSection = document.querySelector('[data-section="book"]') as HTMLElement;
      const chapterSection = document.querySelector('[data-section="chapter"]') as HTMLElement;
      const partSection = document.querySelector('[data-section="part"]') as HTMLElement;
      function highlightTab() {
        let active = 'book';
        if (partSection && partSection.getBoundingClientRect().top < window.innerHeight/2) {
          active = 'part';
        } else if (chapterSection && chapterSection.getBoundingClientRect().top < window.innerHeight/2) {
          active = 'chapter';
        }
        tabs.forEach(tab => {
          if (tab.dataset.tab === active) tab.classList.add('active');
          else tab.classList.remove('active');
        });
      }
      window.addEventListener('scroll', highlightTab);
      window.addEventListener('resize', highlightTab);
      highlightTab();

      // Make tabs clickable to scroll to their section
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          if (tab.dataset.tab === 'book') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            let section: HTMLElement | null = null;
            if (tab.dataset.tab === 'chapter') section = chapterSection;
            else if (tab.dataset.tab === 'part') section = partSection;
            if (section) {
              section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    }, 0);

    // Find the element with the highest data-scroll-priority and scroll to it
    setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('[data-scroll-priority]')) as HTMLElement[];
      if (elements.length > 0) {
        let maxPriority = -Infinity;
        let target: HTMLElement | null = null;
        for (const el of elements) {
          const val = Number(el.getAttribute('data-scroll-priority'));
          if (!isNaN(val) && val > maxPriority) {
            maxPriority = val;
            target = el;
          }
        }
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 0);

    this.resizeTextAreas();
    await this.addEventListeners();
  }

  async addEventListeners() {
    const newBookButton = document.getElementById('new-book');

    if (newBookButton) {
      newBookButton.addEventListener('click', async () => {
        createModal("Create Book", "Create", [{
          name: "manual",
          label: "Create Manually",
          type: "boolean"
        }, {
          name: "description",
          label: "Description",
          type: "plaintext",
          placeholder: "A story about knights and dragons",
          showIf: {
            fieldName: "manual",
            value: false,
          }
        }, {
          name: "min",
          label: "Minimum Chapters",
          type: "plaintext",
          showIf: {
            fieldName: "manual",
            value: false,
          }
        }, {
          name: "max",
          label: "Maximum Chapters",
          type: "plaintext",
          showIf: {
            fieldName: "manual",
            value: false,
          }
        }, {
          name: "title",
          label: "Title",
          type: "plaintext",
          showIf: {
            fieldName: "manual",
            value: true,
          }
        }], this.handleCreateBookModalSubmit.bind(this));
      });
    }
  }

  async handleCreateBookModalSubmit(result: ModalSubmitDetail[]) {
    const manual = getExpectedBooleanValue(result, "manual");

    if (manual) {
      const title = getExpectedStringValue(result, "title");
      const book = await addEmptyBook({
        title,
      });
      window.location.pathname = `/book/${book.id}`;
    } else {
      const description = getExpectedStringValue(result, "description");
      const min = getExpectedNumberValue(result, "min");
      const max = getExpectedNumberValue(result, "max");
      const bookId = await createBook({
        description,
        min,
        max,
      });
      window.location.pathname = `/book/${bookId}`;
    }
  }

  resizeTextAreas() {
    const textareas: NodeListOf<HTMLTextAreaElement> =
      document.querySelectorAll("textarea");

    const resizeTextarea = (element: HTMLTextAreaElement) => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };

    textareas.forEach((textarea) => {
      if (textarea) {
        resizeTextarea(textarea);
        textarea.addEventListener("input", () => resizeTextarea(textarea));
        window.addEventListener("load", () => resizeTextarea(textarea));
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
    const partNumber = this.partNumber;
    if (!part || !partNumber) throw new Error("Part not loaded");
    return new BookPage(book, chapter, part, partNumber);
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
    if (!matches || matches.length < 1) throw new Error("Match not found");
    this.bookId = matches[1];
    await this.loadBook();
    const book = this.book;
    if (!book) throw new Error("Book not loaded");
  }

  async getChapterFromRoute() {
    const matches = location.pathname.match(
      /^\/book\/([^\/]+)\/chapter\/([^\/]+)/,
    );
    if (!matches || matches.length < 3) throw new Error("Match not found");
    const chapterIndex = parseInt(matches[2]) - 1;
    const book = this.book;
    if (!book) throw new Error("Book not loaded");
    this.chapter = book.chapters[chapterIndex];
  }

  async getPartFromRoute() {
    const matches = location.pathname.match(
      /^\/book\/([^\/]+)\/chapter\/([^\/]+)\/part\/([^\/]+)/,
    );
    if (!matches || matches.length < 4) throw new Error("Match not found");
    const chapterIndex = parseInt(matches[2]) - 1;
    const partIndex = parseInt(matches[3]) - 1;
    const book = this.book;
    if (!book) throw new Error("Book not loaded");
    const chapter = book.chapters[chapterIndex];
    if (!chapter) throw new Error("Chapter not found");
    this.part = chapter.parts[partIndex];
    this.partNumber = partIndex + 1;
  }
}

const app = new ClientApp("app");
app.init();

// Function to handle navigation
function navigate(event: Event) {
  const target = event.target as HTMLElement;
  const anchor = target as HTMLAnchorElement;
  if (target.tagName === "A" && anchor.href && !target.hasAttribute("download")) {
    event.preventDefault();
    const url = new URL(anchor.href);
    const path = url.pathname;
    window.history.pushState({}, "", path);
    app.render();
  }
}

// Add event listener to capture all clicks on links
document.addEventListener("click", navigate);
