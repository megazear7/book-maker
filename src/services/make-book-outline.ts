import OpenAI from "openai";
import { getJsonCompletion } from "./get-json-completion.js";
import { BookInput } from "../types/book.type.js";
import { ModelName, Prompt, Role } from "../types/prompt.type.js";
import { ChatCompletionMessageParam } from "openai/resources.js";
import { promises as fs } from "fs";
import { env } from "./env.js";
import { createEmpty } from './util.js';

const systemPrompt = `
You are a book config creator.
Given instructions from the user, you create a book congif

The model text should be grok and the model audio should be gpt.
There should be 5-8 chapters.
Each reference should include multiple paragraphs of sample writing to esablish a writing tone and style.
The tokens and dollars in the usage section must be 0.

The users next prompt will include a description of the book outline that needs written.
`.trim();

export async function makeBookOutline(modelName: ModelName, client: OpenAI, prompt: Prompt): Promise<void> {
    const history: ChatCompletionMessageParam[] = [{
        role: Role.enum.system,
        content: systemPrompt,
    }, {
        role: Role.enum.user,
        content: prompt,
    }];
    // TODO We need a book file before we call the completion, but we need to call the completion to create the file?!?
    const result = await getJsonCompletion(modelName, client, history, BookInput);
    await fs.mkdir(`books`, { recursive: true });
    await fs.writeFile(`books/book.${result.id}.json`, JSON.stringify(result, undefined, 4));
}

const client = new OpenAI({
    baseURL: env(`GROK_BASE_URL`),
    apiKey: env(`GROK_API_KEY`),
});
await makeBookOutline(env(`GROK_MODEL_NAME`), client, "A story about a knight, a dragon, and a princess that needs rescued.");
