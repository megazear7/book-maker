import { BookId, ChapterNumber, ChapterOutline } from "../types/book.type.js";

export async function createChapterOutline(book: BookId, chapter: ChapterNumber): Promise<ChapterOutline> {
    const res = await fetch(`/api/book/${book}/chapter/${chapter}/parts`, {
        method: "POST",
    });
    const json = await res.json();
    return ChapterOutline.parse(json);
}
