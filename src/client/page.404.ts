import { Page } from "./page.interface";

export class Page404 implements Page {
  constructor() {}

  render(root: HTMLElement): void {
    root.innerHTML = `
            <h1>Page not found<h1>
        `;
  }

  async addEventListeners(): Promise<void> {}
}
