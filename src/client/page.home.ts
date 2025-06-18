import { Page } from "./page.interface";

export class HomePage implements Page {
    constructor() {
    }

    render(root: HTMLElement) {
        root.innerHTML = `
            <h1>Book Maker</h1>
            <p>TODO Provide instructions, intro, abiltiy to create new books from scratch, etc.</p>
        `
    }

    async addEventListeners() {

    }
}
