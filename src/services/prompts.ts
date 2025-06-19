import { Book } from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";

export const referencesPrompt = (book: Book): ChatCompletionMessageParam[] => [{
    role: "user",
    content: `
${book.references.join('\n\n\n\n')}



The above text is existing written material from the author.
Any new chapters that you write should be written in the same style and vocabulary.
When writing new chapters, you should try to match this writing style as much as possible.
`
}]

export const bookOverviewPrompt = (book: Book): ChatCompletionMessageParam[] => [{
    role: "user",
    content: `
${book.overview}



The above is an overview of the book that you will be writing.
`
}]

export const writtenChaptersPrompt = (book: Book): ChatCompletionMessageParam[] => {
    return book.chapters
        .filter(chapter => chapter.parts.length > 0)
        .map(chapter => ({
            role: "user",
            content: `
Chapter ${chapter.number}: ${chapter.title}

${chapter.parts.map(part => part.text).join('\n')}
`,
        }));
}
