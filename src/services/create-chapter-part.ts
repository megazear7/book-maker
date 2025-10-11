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
import OpenAI from "openai";
import { diff } from "../shared/diff.js";
import { promises as fs } from "fs";

export async function createChapterPart(
  bookId: BookId,
  chapterNumber: ChapterNumber,
  partNumber: ChapterPartNumber,
): Promise<ChapterPart> {
  const book: Book = await getBook(bookId);
  const client = await getTextClient(book);
  const chapter: Chapter = book.chapters[chapterNumber - 1];
  const authoredPart = await authorPart(book, chapter, client, partNumber);
  const fixedPlotPart = await fixPlot(book, chapter, client, partNumber);
  const fixedQualityPart = await fixQuality(book, chapter, client, partNumber);

  await fs.writeFile(`debug/create-chapter-part-diff.json`, JSON.stringify({
    plotFixes: diff(authoredPart.text, fixedPlotPart.text),
    qualityFixes: diff(fixedPlotPart.text, fixedQualityPart.text),
  }, null, 2));
  await fs.writeFile(`debug/create-chapter-part-01-authored-part.txt`, authoredPart.text);
  await fs.writeFile(`debug/create-chapter-part-02-fixed-plot-part.txt`, fixedPlotPart.text);
  await fs.writeFile(`debug/create-chapter-part-03-fixed-quality-part.txt`, fixedQualityPart.text);

  return fixedQualityPart;
}

const authorPart = async (
  book: Book,
  chapter: Chapter,
  client: OpenAI,
  partNumber: ChapterPartNumber,
): Promise<ChapterPart> => {
  const partDescription: ChapterPartDescription =
    chapter.outline[partNumber - 1];

  const history: ChatCompletionMessageParam[] = [
    ...charactersPrompt(book),
    ...(await referencesPrompt(book, ReferenceUse.enum.writing)),
    ...editInstructionsPrompt(book),
    ...writtenChaptersPrompt(book, chapter),
    ...priorPartsPrompt(chapter, partNumber),
    ...makeChapterPartPrompt(chapter, partNumber, partDescription),
  ];

  const chapterPart = await sendPartPrompt(
    history,
    book,
    chapter,
    partNumber,
    client,
    `Generating part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
    `Writing updates for part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
  );
  return chapterPart;
}

const fixPlot = async (
  book: Book,
  chapter: Chapter,
  client: OpenAI,
  partNumber: ChapterPartNumber,
): Promise<ChapterPart> => {
  const partDescription: ChapterPartDescription =
    chapter.outline[partNumber - 1];

  const history: ChatCompletionMessageParam[] = [
    ...(await referencesPrompt(book, ReferenceUse.enum.plot)),
    ...makeFixPlotPrompt(chapter, partNumber, partDescription, chapter.parts[partNumber - 1].text),
  ];

  const chapterPart = await sendPartPrompt(
    history,
    book,
    chapter,
    partNumber,
    client,
    `Fixing plot for part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
    `Plot fixed for part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
  );
  return chapterPart;
}

const fixQuality = async (
  book: Book,
  chapter: Chapter,
  client: OpenAI,
  partNumber: ChapterPartNumber,
): Promise<ChapterPart> => {
  const partDescription: ChapterPartDescription =
    chapter.outline[partNumber - 1];

  const history: ChatCompletionMessageParam[] = [
    ...editInstructionsPrompt(book),
    ...makeFixQualityPrompt(chapter, partNumber, partDescription, chapter.parts[partNumber - 1].text),
  ];

  const chapterPart = await sendPartPrompt(
    history,
    book,
    chapter,
    partNumber,
    client,
    `Improving quality for part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
    `Quality improved for part ${partNumber} of chapter ${chapter.number} of book ${book.title}`,
  );
  return chapterPart;
}

const sendPartPrompt = async (
  history: ChatCompletionMessageParam[],
  book: Book,
  chapter: Chapter,
  partNumber: ChapterPartNumber,
  client: OpenAI,
  startMessage: string,
  endMessage: string,
): Promise<ChapterPart> => {
  console.log(startMessage);
  const chapterPartText = await getJsonCompletion<BookChapterPartText>(
    book,
    client,
    history,
  );
  const chapterPart = {
    text: chapterPartText,
  };
  chapter.parts[partNumber - 1] = chapterPart;
  console.log(endMessage);
  await writeBook(book);
  return chapterPart;
}

const makeChapterPartPrompt = (
  chapter: Chapter,
  part: number,
  partDescription: ChapterPartDescription,
): ChatCompletionMessageParam[] => {
  let partsAndChapters = "";
  if (chapter.number === 1 && part > 1) {
    partsAndChapters = "parts";
  } else if (chapter.number > 1 && part === 1) {
    partsAndChapters = "chapters";
  } else if (chapter.number > 1 && part > 1) {
    partsAndChapters = "parts and chapters";
  }

  const referenceMsg =
    chapter.number > 1 || part > 1
      ? `Refer to previous ${partsAndChapters} and do NOT continually emphasize the same character developments, motivations, and themes.\n`
      : "";

  return [
    {
      role: "user",
      content: `Part ${part} description: ${partDescription}`,
    },
    {
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
  ];
};

const makeFixPlotPrompt = (
  chapter: Chapter,
  part: number,
  partDescription: ChapterPartDescription,
  currentText: string,
): ChatCompletionMessageParam[] => {
  return [
    {
      role: "user",
      content: `Part ${part} description: ${partDescription}`,
    },
    {
      role: "user",
      content: `Current text for part ${part}:\n${currentText}`,
    },
    {
      role: "user",
      content: `
Fix any plot inconsistencies, logical errors, or continuity issues in this part based on the previous parts, chapters, and the overall book.
Ensure the story progresses logically and maintains coherence with the established plot.
Do not change the core content or add new elements unless necessary to fix inconsistencies.
Reply with the improved text only, without any additional comments or formatting.
`.trim(),
    },
  ];
};

const makeFixQualityPrompt = (
  chapter: Chapter,
  part: number,
  partDescription: ChapterPartDescription,
  currentText: string,
): ChatCompletionMessageParam[] => {
  const lastPart = chapter.parts.length === part;
  return [
    {
      role: "user",
      content: `Part ${part} description: ${partDescription}`,
    },
    {
      role: "user",
      content: `Current text for part ${part}:\n${currentText}`,
    },
    {
      role: "user",
      content: `
Improve the writing quality of this part by enhancing grammar, style, clarity, and engagement.
Ensure the language is vivid, concise, and appropriate for the book's tone.
${ lastPart ? '' : `The end of each part should flow to the beginning of the next part without a summary or conclusion.`}
Do not change the plot, characters, or core content.
Reply with the improved text only, without any additional comments or formatting.
`.trim(),
    },
  ];
};
