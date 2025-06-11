import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { Book } from "../types/book.type.js";
import { getTextModelConfig } from "./get-model-config.js";
import { writeBook } from "./write-book.js";

export async function getJsonCompletion<T>(book: Book, client: OpenAI, history: ChatCompletionMessageParam[], zod: ZodSchema<T>): Promise<T> {
  const modelConfig = getTextModelConfig(book);
  const innerSchema = zodToJsonSchema(zod);
  const jsonSchemaForOpenAI = {
    name: "schema",
    schema: innerSchema.definitions?.Article || innerSchema,
    strict: true
  };

  const completion = await client.chat.completions.create({
    model: modelConfig.modelName,
    messages: history,
    response_format: {
      type: "json_schema",
      json_schema: jsonSchemaForOpenAI,
    },
  });

  if (!completion.choices[0].message.content) {
    throw new Error("No response");
  }

  if (book.model.text.cost) {
    book.model.text.usage.completion_tokens += completion.usage?.completion_tokens || 0;
    book.model.text.usage.prompt_tokens += completion.usage?.prompt_tokens || 0;
    await writeBook(book);
  }

  try {
    return zod.parse(JSON.parse(completion.choices[0].message.content));
  } catch (error: any) {
    console.error(completion.choices[0].message.content);
    throw error;
  }
}
