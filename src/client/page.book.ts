import { Book, BookId } from "../types/book.type.js";

export const bookPage = (books: BookId[], book: Book) => `
    <h1>${book.title}</h1>
`;
