import { promises as fs } from "fs";
import { Book, BookId } from "../types/book.type.js";

export async function getBook(id: BookId): Promise<Book> {
  console.log("Loading book from", `books/book.${id}.json`);
  return Book.parse(
    JSON.parse(await fs.readFile(`books/book.${id}.json`, "utf-8")),
  );
}
