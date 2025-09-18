import { BookId, Chapter } from "../types/book.type.js";
import { getBook } from "./get-book.js";
import { writeBook } from "./write-book.js";

export async function addEmptyChapter(bookId: BookId): Promise<Chapter> {
  const book = await getBook(bookId);
  const emptyChapter = {
    number: book.chapters.length + 1,
    title: "Unnamed Chapter",
    when: "",
    where: "",
    what: "",
    why: "",
    how: "",
    who: "",
    minParts: 3,
    maxParts: 5,
    partLength: 600,
    outline: [],
    parts: [],
  };

  book.chapters.push(emptyChapter);

  await writeBook(book);

  return emptyChapter;
}
