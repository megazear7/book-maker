import OpenAI from "openai";
import { getJsonCompletion } from "./get-json-completion";
import { BookInput } from "../types/book.type.js";
import { Role } from "../types/prompt.type";
import { ChatCompletionMessageParam } from "openai/resources";
import { promises as fs } from "fs";
import { getRandomLetters } from "./util";
import { env } from "./env";

const prompt = `
Create a sample book config.

The model text should be grok and the model audio should be gpt.
`.trim();

export async function makeSampleConfig(modelName: string, client: OpenAI): Promise<void> {
    const history: ChatCompletionMessageParam[] = [{
        role: Role.enum.user,
        content: prompt,
    }];
    const result = await getJsonCompletion(modelName, client, history, BookInput);
    await fs.writeFile(`book.${getRandomLetters(3)}.json`, JSON.stringify(result, undefined, 4));
}

const client = new OpenAI({
    baseURL: env(`GROK_BASE_URL`),
    apiKey: env(`GROK_API_KEY`),
});
await makeSampleConfig("grok", client);
