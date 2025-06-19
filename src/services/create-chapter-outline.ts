import { Book, BookId, Chapter, ChapterNumber, ChapterOutline } from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getTextClient } from "./client.js";
import { getJsonCompletion } from "./get-json-completion.js";
import { getBook } from "./get-book.js";
import { bookOverviewPrompt, chapterDetailsPrompt, referencesPrompt, writtenChaptersPrompt } from "./prompts.js";
import { writeBook } from "./write-book.js";

export async function createChapterOutline(bookId: BookId, chapterNumber: ChapterNumber): Promise<ChapterOutline> {
    const book: Book = await getBook(bookId);
    const chapter: Chapter = book.chapters[chapterNumber - 1];
    console.log(`Generating chapter outline for ${chapter.number} of book ${book.title}`);
    const history: ChatCompletionMessageParam[] = [
        ...referencesPrompt(book),
        ...bookOverviewPrompt(book),
        ...writtenChaptersPrompt(book),
        ...chapterDetailsPrompt(chapter),
        ...makeChapterOutlinePrompt(chapter),
    ];
    const client = await getTextClient(book);
    const outline = await getJsonCompletion(book, client, history, ChapterOutline);
    chapter.outline = outline;
    console.log(`Writing updates for chapter ${chapter.number} of book ${book.title}`);
    await writeBook(book);

    return outline;
}

const makeChapterOutlinePrompt = (chapter: Chapter): ChatCompletionMessageParam[] => [{
    role: "user",
    content: `
I want you to outline the "${chapter.title}" chapter into ${chapter.minParts} to ${chapter.maxParts} distinct parts.
`
}];
