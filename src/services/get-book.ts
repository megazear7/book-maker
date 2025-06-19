import { promises as fs } from "fs";
import { Book, BookId } from "../types/book.type.js";

export async function getBook(id: BookId): Promise<Book> {
  return Book.parse(
    JSON.parse(await fs.readFile(`books/book.${id}.json`, "utf-8")),
  );
}
