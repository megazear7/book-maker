import {
  Book,
  BookId,
  Chapter,
  ChapterNumber,
  ChapterOutline,
  ReferenceUse,
} from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getTextClient } from "./client.js";
import { getJsonCompletion } from "./get-json-completion.js";
import { getBook } from "./get-book.js";
import {
  bookOverviewPrompt,
  chapterDetailsPrompt,
  referencesPrompt,
  writtenChaptersPrompt,
  charactersPrompt,
} from "./prompts.js";
import { writeBook } from "./write-book.js";

export async function createChapterOutline(
  bookId: BookId,
  chapterNumber: ChapterNumber,
): Promise<ChapterOutline> {
  const book: Book = await getBook(bookId);
  const chapter: Chapter = book.chapters[chapterNumber - 1];
  console.log(
    `Generating chapter outline for ${chapter.number} of book ${book.title}`,
  );

  const initialPromptTokens = book.model.text.usage.prompt_tokens;
  const initialCompletionTokens = book.model.text.usage.completion_tokens;

  const history: ChatCompletionMessageParam[] = [
    ...(await referencesPrompt(book, ReferenceUse.enum.outlining)),
    ...bookOverviewPrompt(book),
    ...charactersPrompt(book),
    ...writtenChaptersPrompt(book),
    ...chapterDetailsPrompt(chapter),
    ...makeChapterOutlinePrompt(chapter),
  ];
  const client = await getTextClient(book);
  console.log(`Sending API request for chapter outline...`);
  const outline = await getJsonCompletion(
    book,
    client,
    history,
    ChapterOutline,
  );
  chapter.outline = outline;
  console.log(
    `Writing updates for chapter ${chapter.number} of book ${book.title}`,
  );
  await writeBook(book);

  const finalPromptTokens = book.model.text.usage.prompt_tokens;
  const finalCompletionTokens = book.model.text.usage.completion_tokens;
  const promptTokensUsed = finalPromptTokens - initialPromptTokens;
  const completionTokensUsed = finalCompletionTokens - initialCompletionTokens;
  console.log(
    `Chapter outline generation complete. Tokens used: ${promptTokensUsed} prompt, ${completionTokensUsed} completion`,
  );

  return outline;
}

const makeChapterOutlinePrompt = (
  chapter: Chapter,
): ChatCompletionMessageParam[] => [
  {
    role: "user",
    content: `
I want you to outline the "${chapter.title}" chapter into ${chapter.minParts} to ${chapter.maxParts} distinct parts.
`,
  },
];
