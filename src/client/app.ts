import {
  Book,
  BookId,
  BookMinimalInfo,
  Chapter,
  ChapterPart,
  ChapterPartNumber,
} from "../types/book.type.js";
import { PageName } from "../types/app.type.js";
import { BookPage } from "./page.book.js";
import { HomePage } from "./page.home.js";
import { Page404 } from "./page.404.js";
import "/example.js";
import { Page } from "./page.interface.js";
import { plusIcon } from "./service.icon.js";
import { homeIcon } from "./service.icon.js";
import { addEmptyBook, createBook } from "./service.api.js";
import {
  createModal,
  getExpectedBooleanValue,
  getExpectedNumberValue,
  getExpectedStringValue,
  ModalSubmitDetail,
} from "./service.modal.js";
import { BookmarkTabs } from "./component.bookmark-tabs.js";

class ClientApp {
  rootElementId: string;
  pageName: PageName = "home";
  books: BookMinimalInfo[] = [];
  bookId?: BookId;
  book?: Book;
  chapter?: Chapter;
  part?: ChapterPart;
  partNumber?: ChapterPartNumber;

  constructor(rootElementId: string) {
    this.rootElementId = rootElementId;
  }

  async init(): Promise<void> {
    await this.loadBooks();
    this.render();
  }

  async loadBooks(): Promise<void> {
    this.books = BookMinimalInfo.array().parse(
      await (await fetch("/api/books")).json(),
    );
  }

  async loadBook(): Promise<void> {
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

  async render(): Promise<void> {
    let page: Page = new Page404();
    let pageName: string = "";

    if (location.pathname === "/") {
      pageName = "home";
      page = await this.homePageRouter();
    } else if (
      location.pathname.match(
        new RegExp("^/book/([^/]+)/chapter/([^/]+)/part/([^/]+)"),
      )
    ) {
      pageName = "part";
      page = await this.partPageRouter();
    } else if (
      location.pathname.match(new RegExp("^/book/([^/]+)/chapter/([^/]+)"))
    ) {
      pageName = "chapter";
      page = await this.chapterPageRouter();
    } else if (location.pathname.match(new RegExp("^/book/([^/]+)"))) {
      pageName = "book";
      page = await this.bookPageRouter();
    }

    this.pageName = pageName as PageName;

    this.root.innerHTML = `
      <div data-section="book" data-scroll-priority="1"></div>
      ${new BookmarkTabs(this.pageName).render()}
      <div class="container">
        <ul class="pills">
          <li class="${pageName === "home"}">
            <a href="/">${homeIcon}</a>
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
            <button class="clean" id="new-book"><span class="button-inner">${plusIcon}New Book</span></button>
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

    // Find the element with the highest data-scroll-priority and scroll to it
    setTimeout(() => {
      // Use sessionStorage to compare current and previous URLs
      const currentUrl =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      const previousUrl = sessionStorage.getItem("previousUrl");
      // Only scroll if the URL has changed
      if (currentUrl !== previousUrl) {
        const elements = Array.from(
          document.querySelectorAll("[data-scroll-priority]"),
        ) as HTMLElement[];
        if (elements.length > 0) {
          let maxPriority = -Infinity;
          let target: HTMLElement | null = null;
          for (const el of elements) {
            const val = Number(el.getAttribute("data-scroll-priority"));
            if (!isNaN(val) && val > maxPriority) {
              maxPriority = val;
              target = el;
            }
          }
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      } else {
        // Scroll to the "currentScrollPosition" if it exists in sessionStorage
        const scrollY = sessionStorage.getItem("currentScrollPosition");
        if (scrollY !== null) {
          window.scrollTo({ top: parseInt(scrollY, 10), behavior: "instant" });
        }
      }
      sessionStorage.setItem(
        "previousUrl",
        window.location.pathname +
          window.location.search +
          window.location.hash,
      );
    }, 0);

    setTimeout(() => {
      let scrollTimeout: number | null = null;
      window.addEventListener("scroll", () => {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = window.setTimeout(() => {
          sessionStorage.setItem(
            "currentScrollPosition",
            window.scrollY.toString(),
          );
        }, 100);
      });
    }, 0);

    this.resizeTextAreas();
    await this.addEventListeners();
  }

  async addEventListeners(): Promise<void> {
    await new BookmarkTabs(this.pageName).addEventListeners();

    const newBookButton = document.getElementById("new-book");

    if (newBookButton) {
      newBookButton.addEventListener("click", async () => {
        createModal(
          "Create Book",
          "Create",
          [
            {
              name: "generateImmediately",
              label: "Generate Immediately",
              type: "boolean",
              default: "true",
            },
            {
              name: "description",
              label: "Description",
              type: "plaintext",
              placeholder: "A story about knights and dragons",
              showIf: {
                fieldName: "generateImmediately",
                value: true,
              },
            },
            {
              name: "min",
              label: "Minimum Chapters",
              type: "plaintext",
              showIf: {
                fieldName: "generateImmediately",
                value: true,
              },
            },
            {
              name: "max",
              label: "Maximum Chapters",
              type: "plaintext",
              showIf: {
                fieldName: "generateImmediately",
                value: true,
              },
            },
            {
              name: "title",
              label: "Title",
              type: "plaintext",
              showIf: {
                fieldName: "generateImmediately",
                value: false,
              },
            },
          ],
          this.handleCreateBookModalSubmit.bind(this),
        );
      });
    }
  }

  async handleCreateBookModalSubmit(
    result: ModalSubmitDetail[],
  ): Promise<void> {
    const generateImmediately = getExpectedBooleanValue(
      result,
      "generateImmediately",
    );

    if (generateImmediately) {
      const description = getExpectedStringValue(result, "description");
      const min = getExpectedNumberValue(result, "min");
      const max = getExpectedNumberValue(result, "max");
      const bookId = await createBook({
        description,
        min,
        max,
      });
      window.location.pathname = `/book/${bookId}`;
    } else {
      const title = getExpectedStringValue(result, "title");
      const book = await addEmptyBook({
        title,
      });
      window.location.pathname = `/book/${book.id}`;
    }
  }

  resizeTextAreas(): void {
    const textareas: NodeListOf<HTMLTextAreaElement> =
      document.querySelectorAll("textarea");

    const resizeTextarea = (element: HTMLTextAreaElement): void => {
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

  async getBookFromRoute(): Promise<void> {
    const matches = location.pathname.match(new RegExp("^/book/([^/]+)"));
    if (!matches || matches.length < 1) throw new Error("Match not found");
    this.bookId = matches[1];
    await this.loadBook();
    const book = this.book;
    if (!book) throw new Error("Book not loaded");
  }

  async getChapterFromRoute(): Promise<void> {
    const matches = location.pathname.match(
      new RegExp("^/book/([^/]+)/chapter/([^/]+)"),
    );
    if (!matches || matches.length < 3) throw new Error("Match not found");
    const chapterIndex = parseInt(matches[2]) - 1;
    const book = this.book;
    if (!book) throw new Error("Book not loaded");
    this.chapter = book.chapters[chapterIndex];
  }

  async getPartFromRoute(): Promise<void> {
    const matches = location.pathname.match(
      new RegExp("^/book/([^/]+)/chapter/([^/]+)/part/([^/]+)"),
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
function navigate(event: Event): void {
  const target = event.target as HTMLElement;
  const anchor = target as HTMLAnchorElement;
  if (
    target.tagName === "A" &&
    anchor.href &&
    !target.hasAttribute("download")
  ) {
    sessionStorage.setItem("previousUrl", "");
    event.preventDefault();
    const url = new URL(anchor.href);
    const path = url.pathname;
    window.history.pushState({}, "", path);
    app.render();
  }
}

// Add event listener to capture all clicks on links
document.addEventListener("click", navigate);
