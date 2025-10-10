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
  console.log(
    `Generating chapter ${chapter.number} of book ${book.title} with ${chapter.outline.length} parts`,
  );
  const parts: ChapterParts = [];

  for (
    let partNumber: ChapterPartNumber = 1;
    partNumber <= chapter.outline.length;
    partNumber++
  ) {
    parts.push({
      text: "",
    });
  }

  for (
    let partNumber: ChapterPartNumber = 1;
    partNumber <= chapter.outline.length;
    partNumber++
  ) {
    console.log(
      `Generating part ${partNumber}/${chapter.outline.length} for chapter ${chapter.number}`,
    );
    const part = await createChapterPart(bookId, chapterNumber, partNumber);
    parts[partNumber - 1] = part;
  }

  console.log(
    `Chapter ${chapter.number} generation complete with ${parts.length} parts`,
  );
  return parts;
}
