import OpenAI from "openai";
import { getJsonCompletion } from "./get-json-completion.js";
import { Book, BookId, ModelTypeName } from "../types/book.type.js";
import { Prompt, Role } from "../types/prompt.type.js";
import { ChatCompletionMessageParam } from "openai/resources.js";
import { promises as fs } from "fs";
import { createEmpty } from "./util.js";
import { writeBook } from "./write-book.js";
import { MaximumChapters, MinimumChapters } from "../types/requests.js";

const systemPrompt = (min: MinimumChapters, max: MaximumChapters): string =>
  `
You are a book config creator.
Given instructions from the user, you create a book congif

The model text should be grok and the model audio should be gpt.
There should be ${min}-${max} chapters.
Each reference should include multiple paragraphs of sample writing to esablish a writing tone and style.
The book id should be less than 12 characters.
The tokens and dollars in the usage section must be 0.
The references should be an empty array.
The part length should be 600, 800, or 1000.
The chapter outline and part attributes should be empty arrays.

The users next prompt will include a description of the book outline that needs written.
`.trim();

export async function makeBookOutline(
  client: OpenAI,
  textModelTypeName: ModelTypeName,
  audioModelTypeName: ModelTypeName,
  prompt: Prompt,
  min: MinimumChapters,
  max: MaximumChapters,
): Promise<BookId> {
  const tmpBook = createEmpty(Book);
  tmpBook.model.text.name = textModelTypeName;
  tmpBook.model.audio.name = audioModelTypeName;
  await writeBook(tmpBook);
  const history: ChatCompletionMessageParam[] = [
    {
      role: Role.enum.system,
      content: systemPrompt(min, max),
    },
    {
      role: Role.enum.user,
      content: prompt,
    },
  ];
  const book = await getJsonCompletion(tmpBook, client, history, Book);
  book.model.text.name = textModelTypeName;
  book.model.audio.name = audioModelTypeName;
  book.model.text.cost.inputTokenCost = 3;
  book.model.text.cost.outputTokenCost = 15;
  await writeBook(book);
  await fs.rm("books/book.000.json");
  return book.id;
}
