import {
  Book,
  BookChapterPartText,
  BookId,
  Chapter,
  ChapterNumber,
  ChapterPart,
  ChapterPartDescription,
  ChapterPartNumber,
  ChapterParts,
} from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getTextClient } from "./client.js";
import { getJsonCompletion } from "./get-json-completion.js";
import { getBook } from "./get-book.js";
import {
  bookOverviewPrompt,
  chapterDetailsPrompt,
  existingPartsPrompt,
  referencesPrompt,
  writtenChaptersPrompt,
} from "./prompts.js";
import { writeBook } from "./write-book.js";

export async function createChapter(
  bookId: BookId,
  chapterNumber: ChapterNumber,
): Promise<ChapterParts> {
  const book: Book = await getBook(bookId);
  const chapter: Chapter = book.chapters[chapterNumber - 1];
  console.log(`Generating chapter ${chapter.number} of book ${book.title}`);
  const parts: ChapterParts = [];

  for (
    let partNumber: ChapterPartNumber = 1;
    partNumber <= chapter.outline.length;
    partNumber++
  ) {
    const partDescription: ChapterPartDescription =
      chapter.outline[partNumber - 1];
    const part = await createChapterPart(
      book,
      chapter,
      partNumber,
      partDescription,
    );
    parts.push(part);
  }

  return parts;
}

export async function createChapterPart(
  book: Book,
  chapter: Chapter,
  partNumber: ChapterPartNumber,
  partDescription: ChapterPartDescription,
): Promise<ChapterPart> {
  console.log(
    `Generating part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
  );

  const history: ChatCompletionMessageParam[] = [
    ...referencesPrompt(book),
    ...bookOverviewPrompt(book),
    ...writtenChaptersPrompt(book),
    ...chapterDetailsPrompt(chapter),
    ...existingPartsPrompt(chapter),
    ...makeChapterPartPrompt(chapter, partNumber, partDescription),
  ];
  const client = await getTextClient(book);
  const chapterPartText = await getJsonCompletion(
    book,
    client,
    history,
    BookChapterPartText,
  );
  const chapterPart = {
    text: chapterPartText,
  };
  chapter.parts[partNumber - 1] = chapterPart;
  console.log(
    `Writing updates for part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
  );
  await writeBook(book);

  return chapterPart;
}

const makeChapterPartPrompt = (
  chapter: Chapter,
  part: number,
  partDescription: ChapterPartDescription,
): ChatCompletionMessageParam[] => [
  {
    role: "user",
    content: `
${partDescription}

I want you to write part ${part} the "${chapter.title}" chapter based on the above description${part > 0 ? " and the existing parts that were provided previously" : ""}.
`,
  },
];
