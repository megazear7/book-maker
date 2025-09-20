import { Book, Chapter, ReferenceUse } from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { loadFiles } from "./util.js";

export const existingPartsPrompt = (
  chapter: Chapter,
): ChatCompletionMessageParam[] => [
  {
    role: "user",
    content: `
${chapter.parts.map((part) => part.text).join("\n")}
`,
  },
];

export const chapterDetailsPrompt = (
  chapter: Chapter,
): ChatCompletionMessageParam[] => [
  {
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
`,
  },
];

// TODO the fileContent could be a docx file or other file format. Need to handle that.
export const referencesPrompt = (
  book: Book,
  use: ReferenceUse,
): ChatCompletionMessageParam[] => [
  {
    role: "user",
    content: book.references
      .filter((ref) => ref.whenToUse.includes(use))
      .map((ref) => loadFiles(ref))
      .map(
        (ref) => `
${ref.fileContent}

${ref.instructions}
`,
      )
      .join("\n\n\n\n\n"),
  },
];

export const bookOverviewPrompt = (
  book: Book,
): ChatCompletionMessageParam[] => [
  {
    role: "user",
    content: `
${book.overview}



The above is an overview of the book that you will be writing.
`,
  },
];

export const writtenChaptersPrompt = (
  book: Book,
): ChatCompletionMessageParam[] => {
  return book.chapters
    .filter((chapter) => chapter.parts.length > 0)
    .map((chapter) => ({
      role: "user",
      content: `
Chapter ${chapter.number}: ${chapter.title}

${chapter.parts.map((part) => part.text).join("\n")}
`,
    }));
};
