import { Book, Chapter, ChapterPartNumber, LoadedBookReference, ReferenceUse } from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { loadFiles } from "./util.js";

export const priorPartsPrompt = (
  chapter: Chapter,
  partNumber: ChapterPartNumber,
): ChatCompletionMessageParam[] => {
  const priorParts = chapter.parts.slice(0, partNumber - 1);
  return priorParts.length > 0 ? [
    {
      role: "user",
      content: `
Chapter ${chapter.number} ${priorParts.length > 1 ? `parts ${1} through ${priorParts.length + 1}` : `part 1:`}:

${priorParts.map((part) => part.text).join("\n")}
`,
    },
  ] : [];
}

export const chapterDetailsPrompt = (
  chapter: Chapter,
): ChatCompletionMessageParam[] => [
    {
      role: "user",
      content: `
Chapter ${chapter.number}: ${chapter.title}

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

export const editInstructionsPrompt = (
  book: Book,
): ChatCompletionMessageParam[] => [
  {
    role: "user",
    content: book.instructions.edit,
  },
];

export const referencesPrompt = async (
  book: Book,
  use: ReferenceUse,
): Promise<ChatCompletionMessageParam[]> => {
  const loadedRefs: ChatCompletionMessageParam[] = [];
  for (const ref of book.references) {
    if (ref.whenToUse.includes(use)) {
      const loadedRef = await loadFiles(ref);
      loadedRefs.push({
        role: "user",
        content: loadedRef.fileContent
      });
      loadedRefs.push({
        role: "user",
        content: loadedRef.instructions
      });
    }
  }

  return loadedRefs;
};

export const bookOverviewPrompt = (
  book: Book,
): ChatCompletionMessageParam[] => [
    {
      role: "user",
      content: book.overview,
    }, {
      role: "user",
      content: `The above is an overview of the book that you will be writing.`,
    }
  ];

export const writtenChaptersPrompt = (
  book: Book,
  chapterBeingWritten: Chapter
): ChatCompletionMessageParam[] => {
  const priorChapters = book.chapters.slice(0, chapterBeingWritten.number - 1);
  return priorChapters
    .filter((chapter) => chapter.parts.length > 0 && chapter.number != chapterBeingWritten.number)
    .map((chapter) => ({
      role: "user",
      content: `
Chapter ${chapter.number}: ${chapter.title}

${chapter.parts.map((part) => part.text).join("\n")}
`,
    }));
};

export const charactersPrompt = (book: Book): ChatCompletionMessageParam[] => {
  return book.characters && book.characters.length > 0 ? [
    {
      role: "user",
      content: `
Characters in this book:

${book.characters.map(character => `
${character.name}: ${character.instructions}

Use this as simply background information. Do not reemphasize these character details in every part or chapter.
`.trim()).join("\n\n")}
`,
    },
  ] : []
}

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
