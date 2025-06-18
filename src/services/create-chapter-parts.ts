import { Book, BookId, Chapter, ChapterNumber, ChapterParts } from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getTextClient } from "./client.js";
import { getJsonCompletion } from "./get-json-completion.js";
import { getBook } from "./get-book.js";
import { bookOverviewPrompt, referencesPrompt, writtenChaptersPrompt } from "./prompts.js";

export async function createChapterParts(bookId: BookId, chapterNumber: ChapterNumber): Promise<ChapterParts> {
    const book: Book = await getBook(bookId);
    const chapter: Chapter = book.chapters[chapterNumber - 1];
    const history: ChatCompletionMessageParam[] = [
        ...referencesPrompt(book),
        ...bookOverviewPrompt(book),
        ...writtenChaptersPrompt(book),
        ...chapterDetailsPrompt(chapter),
        ...makeChapterOutlinePrompt(chapter),
    ];
    const client = await getTextClient(book);
    const outline = getJsonCompletion(book, client, history, ChapterParts);

    return outline;
}

const chapterDetailsPrompt = (chapter: Chapter): ChatCompletionMessageParam[] => [{
    role: "user",
    content: `
${chapter.title}

When:
${chapter.when}

Where
${chapter.where}

What
${chapter.what}

Why
${chapter.why}

How
${chapter.how}

Who
${chapter.who}
`
}];

const makeChapterOutlinePrompt = (chapter: Chapter): ChatCompletionMessageParam[] => [{
    role: "user",
    content: `
I want you to outline the "${chapter.title}" chapter into ${chapter.minParts} to ${chapter.maxParts} distinct parts.
`
}];
