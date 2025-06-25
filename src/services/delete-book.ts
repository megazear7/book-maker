import { BookId } from "../types/book.type.js";
import { promises as fs } from "fs";

export async function deleteBook(id: BookId): Promise<void> {
    await fs.rm(`books/book.${id}.json`);
}
