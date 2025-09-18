import { PageName } from "../types/app.type.js";
import { Component } from "./component.interface.js";

export class BookmarkTabs implements Component {
  pageName: PageName;

  constructor(pageName: PageName) {
    this.pageName = pageName;
  }

  render(): string {
    return `
      <div class="bookmark-tabs">
        <div class="bookmark-tab${["book", "chapter", "part"].includes(this.pageName) ? "" : " disabled"}" data-tab="book"><span class="bookmark-tab-inner">Book</span></div>
        <div class="bookmark-tab${["chapter", "part"].includes(this.pageName) ? "" : " disabled"}" data-tab="chapter"><span class="bookmark-tab-inner">Chapter</span></div>
        <div class="bookmark-tab${["part"].includes(this.pageName) ? "" : " disabled"}" data-tab="part"><span class="bookmark-tab-inner">Part</span></div>
      </div>
    `;
  }

  async addEventListeners(): Promise<void> {
    setTimeout(() => {
      const tabs = Array.from(
        document.querySelectorAll(".bookmark-tab"),
      ) as HTMLElement[];
      const bookSection = document.querySelector(
        '[data-section="book"]',
      ) as HTMLElement;
      const chapterSection = document.querySelector(
        '[data-section="chapter"]',
      ) as HTMLElement;
      const partSection = document.querySelector(
        '[data-section="part"]',
      ) as HTMLElement;
      function highlightTab(): void {
        let active = "";
        if (
          partSection &&
          partSection.getBoundingClientRect().top < window.innerHeight / 2
        ) {
          active = "part";
        } else if (
          chapterSection &&
          chapterSection.getBoundingClientRect().top < window.innerHeight / 2
        ) {
          active = "chapter";
        } else if (
          bookSection &&
          bookSection.getBoundingClientRect().top < window.innerHeight / 2
        ) {
          active = "book";
        }
        tabs.forEach((tab) => {
          if (tab.dataset.tab === active) tab.classList.add("active");
          else tab.classList.remove("active");
        });
      }
      window.addEventListener("scroll", highlightTab);
      window.addEventListener("resize", highlightTab);
      highlightTab();

      // Make tabs clickable to scroll to their section
      tabs.forEach((tab) => {
        if (tab.classList.contains("disabled")) return;
        tab.addEventListener("click", () => {
          if (tab.dataset.tab === "book") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            let section: HTMLElement | null = null;
            if (tab.dataset.tab === "chapter") section = chapterSection;
            else if (tab.dataset.tab === "part") section = partSection;
            if (section) {
              section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        });
      });
    }, 0);
  }
}
