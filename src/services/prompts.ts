import { Book } from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";

export const referencesPrompt = (book: Book): ChatCompletionMessageParam[] => [{
    role: "user",
    content: `
The below text is existing written material from the author.
Any new chapters that you write should be written in the same style and vocabulary.
When writing new chapters, you should try to match this writing style as much as possible.

${book.references.join('\n\n\n\n')}
`
}]

export const bookOverviewPrompt = (book: Book): ChatCompletionMessageParam[] => [{
    role: "user",
    content: `
This is an overview of the book that you will be writing.

${book.overview}
`
}]

export const writtenChaptersPrompt = (book: Book): ChatCompletionMessageParam[] => {
    return book.chapters
        .filter(chapter => chapter.created)
        .map(chapter => ({
            role: "user",
            content: chapter.created[chapter.created.length-1].text,
        }));
}
