import { BookId, ChapterNumber, ChapterOutline } from "../types/book.type.js";
import { toggleLoading } from "./loading.js";

export async function createChapterOutline(book: BookId, chapter: ChapterNumber): Promise<ChapterOutline> {
    toggleLoading();
    const res = await fetch(`/api/book/${book}/chapter/${chapter}/parts`, {
        method: "POST",
    });
    const json = await res.json();
    toggleLoading();
    return ChapterOutline.parse(json);
}
