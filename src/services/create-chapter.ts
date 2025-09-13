import {
  Book,
  BookId,
  Chapter,
  ChapterNumber,
  ChapterPartNumber,
  ChapterParts,
} from "../types/book.type.js";
import { getBook } from "./get-book.js";
import { createChapterPart } from "./create-chapter-part.js";

export async function createChapter(
  bookId: BookId,
  chapterNumber: ChapterNumber,
): Promise<ChapterParts> {
  const book: Book = await getBook(bookId);
  const chapter: Chapter = book.chapters[chapterNumber - 1];
  console.log(`Generating chapter ${chapter.number} of book ${book.title}`);
  const parts: ChapterParts = [];

  for (
    let partNumber: ChapterPartNumber = 1;
    partNumber <= chapter.outline.length;
    partNumber++
  ) {
    const part = await createChapterPart(
      bookId,
      chapterNumber,
      partNumber,
    );
    parts.push(part);
  }

  return parts;
}
