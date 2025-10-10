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
  priorPartsPrompt,
  referencesPrompt,
  writtenChaptersPrompt,
  charactersPrompt,
  editInstructionsPrompt,
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
    ...charactersPrompt(book),
    ...(await referencesPrompt(book, ReferenceUse.enum.writing)),
    ...editInstructionsPrompt(book),
    ...writtenChaptersPrompt(book, chapter),
    ...priorPartsPrompt(chapter, partNumber),
    ...makeChapterPartPrompt(chapter, partNumber, partDescription),
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
  chapter: Chapter,
  part: number,
  partDescription: ChapterPartDescription,
): ChatCompletionMessageParam[] => {
  let partsAndChapters = '';
  if (chapter.number === 1 && part > 1) {
    partsAndChapters = 'parts';
  } else if (chapter.number > 1 && part === 1) {
    partsAndChapters = 'chapters';
  } else if (chapter.number > 1 && part > 1) {
    partsAndChapters = 'parts and chapters';
  }

  const referenceMsg = chapter.number > 1 || part > 1 ? `Refer to previous ${partsAndChapters} and do NOT continually emphasize the same character developments, motivations, and themes.\n` : '';

  return [
    {
      role: "user",
      content: `Part ${part} description: ${partDescription}`,
    }, {
      role: "user",
      content: `
Write part ${part} of chapter ${chapter.number} based on the above description${part > 1 ? " and the existing parts that were provided previously. The text should be a continuous flow from the prevous part." : ""}.
${referenceMsg}Do not include the chapter or part title at the beginning or any other information.
Only provide the written text of this part of the book.
Do not use dashes or em dashes such as - and —.
Reply in plain text without formatting.
The length of this part should be about ${chapter.partLength} words long.
You are an incredible author writing the next part of an amazing book.
Do not summarize the characters thoughts or feeling at the end.
`.trim(),
    },
  ]
};
