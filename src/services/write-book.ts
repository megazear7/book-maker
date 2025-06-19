import { promises as fs } from "fs";
import { Book } from "../types/book.type.js";

export async function writeBook(book: Book): Promise<void> {
  await fs.mkdir(`books`, { recursive: true });
  await fs.writeFile(
    `books/book.${book.id}.json`,
    JSON.stringify(book, undefined, 4),
  );
}
