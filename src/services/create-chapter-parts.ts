import { BookId, ChapterNumber, ChapterParts } from "../types/book.type.js";

export async function createChapterParts(book: BookId, chapter: ChapterNumber): Promise<ChapterParts> {

    return [{
        outline: {
            title: "",
            events: []
        },
        created: {
            text: "",
            audio: ""
        }
    }]
}
