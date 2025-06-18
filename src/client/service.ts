import { BookId, ChapterNumber, ChapterParts } from "../types/book.type.js";

export async function createChapterOutline(book: BookId, chapter: ChapterNumber): Promise<ChapterParts> {
    const res = await fetch(`/api/book/${book}/chapter/${chapter}/parts`, {
        method: "POST",
    });
    const json = await res.json();
    return ChapterParts.parse(json);
}
