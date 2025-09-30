import {
  Book,
  BookChapterPartText,
  BookId,
  Chapter,
  ChapterNumber,
  ChapterPart,
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

export interface EditChapterPartOptions {
  addMoreDialog?: boolean;
  useLessDescriptiveLanguage?: boolean;
  replaceUndesirableWords?: boolean;
  splitIntoParagraphs?: boolean;
  removeOutOfPlaceReferences?: boolean;
  additionalInstructions?: string;
}

export async function editChapterPart(
  bookId: BookId,
  chapterNumber: ChapterNumber,
  partNumber: ChapterPartNumber,
  options: EditChapterPartOptions,
): Promise<ChapterPart> {
  const book: Book = await getBook(bookId);
  const chapter: Chapter = book.chapters[chapterNumber - 1];
  const existingPart = chapter.parts[partNumber - 1];

  console.log(
    `Editing part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
  );

  const history: ChatCompletionMessageParam[] = [
    ...(await referencesPrompt(book, ReferenceUse.enum.editing)),
    ...bookOverviewPrompt(book),
    ...charactersPrompt(book),
    ...writtenChaptersPrompt(book, chapter),
    ...chapterDetailsPrompt(chapter),
    ...priorPartsPrompt(chapter, partNumber),
    ...makeEditChapterPartPrompt(existingPart.text, options),
  ];

  const client = await getTextClient(book);
  const editedChapterPartText = await getJsonCompletion<BookChapterPartText>(
    book,
    client,
    history,
  );

  const editedChapterPart = {
    text: editedChapterPartText,
  };

  chapter.parts[partNumber - 1] = editedChapterPart;
  console.log(
    `Writing edits for part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
  );
  await writeBook(book);

  return editedChapterPart;
}

const makeEditChapterPartPrompt = (
  existingText: string,
  options: EditChapterPartOptions,
): ChatCompletionMessageParam[] => {
  const instructions: string[] = [];

  if (options.addMoreDialog) {
    instructions.push("Add more dialog to make the scene more conversational");
  }

  if (options.useLessDescriptiveLanguage) {
    instructions.push("Use less descriptive language to make the writing more concise");
  }

  if (options.replaceUndesirableWords) {
    instructions.push("Replace words that do not match the setting, theme, style, and timeframe of the book");
  }

  if (options.splitIntoParagraphs) {
    instructions.push("Split the text into proper paragraphs for better readability");
  }

  if (options.removeOutOfPlaceReferences) {
    instructions.push("Remove any out-of-place references or anachronisms");
  }

  if (options.additionalInstructions) {
    instructions.push(options.additionalInstructions);
  }

  const instructionText = instructions.length > 0
    ? `Apply the following edits: ${instructions.join(", ")}. `
    : "";

  return [
    {
      role: "user",
      content: `Here is the existing text of this chapter part:

${existingText}

${instructionText}Edit this text while keeping it as similar as possible to the original. Make only the requested changes and preserve the core content, plot, and character actions. Do not rewrite the entire scene - only apply the specified edits.

Return the edited text.`,
    },
  ];
};