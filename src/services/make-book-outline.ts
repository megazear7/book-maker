import OpenAI from "openai";
import { getJsonCompletion } from "./get-json-completion.js";
import { Book, ModelTypeName } from "../types/book.type.js";
import { Prompt, Role } from "../types/prompt.type.js";
import { ChatCompletionMessageParam } from "openai/resources.js";
import { promises as fs } from "fs";
import { env } from "./env.js";
import { createEmpty } from './util.js';
import { writeBook } from "./write-book.js";

const systemPrompt = `
You are a book config creator.
Given instructions from the user, you create a book congif

The model text should be grok and the model audio should be gpt.
There should be 5-8 chapters.
Each reference should include multiple paragraphs of sample writing to esablish a writing tone and style.
The book id should be less than 12 characters.
The tokens and dollars in the usage section must be 0.
The chapter parts and created fields should be empty.

The users next prompt will include a description of the book outline that needs written.
`.trim();

export async function makeBookOutline(client: OpenAI, textModelTypeName: ModelTypeName, audioModelTypeName: ModelTypeName, prompt: Prompt): Promise<void> {
    const tmpBook = createEmpty(Book);
    tmpBook.model.text.name = textModelTypeName;
    tmpBook.model.audio.name = audioModelTypeName;
    await writeBook(tmpBook);
    const history: ChatCompletionMessageParam[] = [{
        role: Role.enum.system,
        content: systemPrompt,
    }, {
        role: Role.enum.user,
        content: prompt,
    }];
    const book = await getJsonCompletion(tmpBook, client, history, Book);
    book.model.text.name = textModelTypeName;
    book.model.audio.name = audioModelTypeName;
    await writeBook(book);
    await fs.rm("books/book.000.json");
}

const client = new OpenAI({
    baseURL: env(`GROK_BASE_URL`),
    apiKey: env(`GROK_API_KEY`),
});
await makeBookOutline(client, 'grok', 'gpt', "A story about a knight, a dragon, and a princess that needs rescued.");
