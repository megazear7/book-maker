import { Book, BookChapterPartAudio, BookId, Chapter, ChapterNumber, ChapterPart, ChapterPartNumber } from "../types/book.type.js";
import { getBook } from "./get-book.js";

export async function getChapterPartAudioId(bookId: BookId, chapterNumber: ChapterNumber, partNumber: ChapterPartNumber): Promise<BookChapterPartAudio | undefined> {
    const book: Book = await getBook(bookId);
    const chapter: Chapter = book.chapters[chapterNumber - 1];
    const part: ChapterPart = chapter.parts[partNumber - 1];

    return part.audio;
}
