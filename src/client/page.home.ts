import { Page } from "./page.interface";

export class HomePage implements Page {
  constructor() {}

  render(root: HTMLElement) {
    root.innerHTML = ``;
  }

  async addEventListeners() {}
}
