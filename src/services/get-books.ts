import { promises as fs } from "fs";
import { BookMinimalInfo } from "../types/book.type.js";
import { getBook } from "./get-book.js";

export async function getBooks(): Promise<BookMinimalInfo[]> {
    const files = await fs.readdir('books');
    const regex = /^book\.(.+)\.json$/;
    const books = [];

    for (const file of files) {
      const match = file.match(regex);
      const id = match ? match[1] : null;

      if (id !== null && id !== "empty") {
        const { title } = await getBook(id);
        books.push({ id, title });
      }
    }

    return books;
}
