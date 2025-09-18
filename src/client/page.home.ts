import { Page } from "./page.interface";

export class HomePage implements Page {
  constructor() {}

  render(root: HTMLElement): void {
    root.innerHTML = ``;
  }

  async addEventListeners(): Promise<void> {}
}
