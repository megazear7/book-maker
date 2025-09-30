import {
  Book,
  BookChapterPartText,
  BookId,
  Chapter,
  ChapterNumber,
  ChapterPart,
  ChapterPartDescription,
  ChapterPartNumber,
  ReferenceUse,
} from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getTextClient } from "./client.js";
import { getJsonCompletion } from "./get-json-completion.js";
import {
  bookOverviewPrompt,
  chapterDetailsPrompt,
  priorPartsPrompt,
  referencesPrompt,
  writtenChaptersPrompt,
  charactersPrompt,
} from "./prompts.js";
import { writeBook } from "./write-book.js";
import { getBook } from "./get-book.js";

export async function createChapterPart(
  bookId: BookId,
  chapterNumber: ChapterNumber,
  partNumber: ChapterPartNumber,
): Promise<ChapterPart> {
  const book: Book = await getBook(bookId);
  const chapter: Chapter = book.chapters[chapterNumber - 1];
  const partDescription: ChapterPartDescription =
    chapter.outline[partNumber - 1];

  console.log(
    `Generating part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
  );

  const history: ChatCompletionMessageParam[] = [
    ...(await referencesPrompt(book, ReferenceUse.enum.writing)),
    ...bookOverviewPrompt(book),
    ...charactersPrompt(book),
    ...writtenChaptersPrompt(book, chapter),
    ...chapterDetailsPrompt(chapter),
    ...priorPartsPrompt(chapter, partNumber),
    ...makeChapterPartPrompt(book, chapter, partNumber, partDescription),
  ];
  const client = await getTextClient(book);
  const chapterPartText = await getJsonCompletion<BookChapterPartText>(
    book,
    client,
    history,
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
  book: Book,
  chapter: Chapter,
  part: number,
  partDescription: ChapterPartDescription,
): ChatCompletionMessageParam[] => [
  {
    role: "user",
    content: book.instructions.edit,
  }, {
    role: "user",
    content: partDescription,
  }, {
    role: "user",
    content: `Write part ${part} of the "${chapter.title}" chapter based on the above description${part > 0 ? " and the existing parts that were provided previously" : ""}.
Do not include the chapter or part title at the beginning or any other information. Only provide the written text of this part of the book. Do not use markdown or any other formatting.`,
  },
];
