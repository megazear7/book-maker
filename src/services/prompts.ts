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

export const referencesPrompt = async (
  book: Book,
  use: ReferenceUse,
): Promise<ChatCompletionMessageParam[]> => {
  const loadedRefs = await Promise.all(
    book.references
      .filter((ref) => ref.whenToUse.includes(use))
      .map((ref) => loadFiles(ref)),
  );

  return [
    {
      role: "user",
      content: loadedRefs
        .map(
          (ref) => `
${ref.fileContent}

${ref.instructions}
`,
        )
        .join("\n\n\n\n\n"),
    },
  ];
};

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

export const generatePreviewSentencePrompt = (
  word: string,
  book: Book,
): ChatCompletionMessageParam[] => [
  {
    role: "system",
    content: `You are helping create a preview sentence for testing pronunciation of the word "${word}" in the context of a book. Create a short, natural sentence that uses the word "${word}" in a way that would appear in this book's style and genre.`,
  },
  {
    role: "user",
    content: `
Book Title: ${book.title}
Book Overview: ${book.overview}

Create a single short sentence (6-15 words) that naturally incorporates the word "${word}" and fits the style and tone of this book. The sentence should demonstrate how the word would be used in context.
`,
  },
];
