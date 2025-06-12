import { promises as fs } from "fs";
import { Book, BookId } from "../types/book.type.js";

export async function getBooks(): Promise<BookId[]> {
    const files = await fs.readdir('books');
    const regex = /^book\.(.+)\.json$/;
    return files
      .map(file => {
        const match = file.match(regex);
        return match ? match[1] : null;
      })
      .filter(result => result !== null);
}
