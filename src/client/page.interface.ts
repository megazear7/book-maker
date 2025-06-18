export interface Page {
    render(root: HTMLElement): void;
    addEventListeners(): Promise<void>;
}
