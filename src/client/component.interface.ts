export interface Component {
  render(root: HTMLElement): void;
  addEventListeners(): Promise<void>;
}
