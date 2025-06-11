import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { Book } from "../types/book.type.js";
import { getTextModelConfig } from "./get-model-config.js";

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

  // TODO Update book json file with completion.usage information.

  try {
    return zod.parse(JSON.parse(completion.choices[0].message.content));
  } catch (error: any) {
    console.error(completion.choices[0].message.content);
    throw error;
  }
}
