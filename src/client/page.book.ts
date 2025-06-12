import { Book, BookId } from "../types/book.type.js";

export const bookPage = (books: BookId[], book: Book) => `
    <h1>${book.title}</h1>
    <p>${book.overview}</p>
    <p>${book.instructions.edit}</p>
    <p>${book.instructions.audio}</p>

    ${book.chapters.map(chapter => `
        <section>
            <p>${chapter.title}</p>
            <p>${chapter.when}</p>
            <p>${chapter.where}</p>
            <p>${chapter.what}</p>
            <p>${chapter.why}</p>
            <p>${chapter.how}</p>
            <p>${chapter.who}</p>
        </section>
    `)}
`;
