import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { model } from "./models.js";

export async function getJsonCompletion<T>(client: OpenAI, history: Array<ChatCompletionMessageParam>, zod: ZodSchema<T>): Promise<T> {
  const innerSchema = zodToJsonSchema(zod);
  const jsonSchemaForOpenAI = {
    name: "schema",
    schema: innerSchema.definitions?.Article || innerSchema,
    strict: true
  };

  const completion = await client.chat.completions.create({
    model: model.name,
    messages: history,
    response_format: {
      type: "json_schema",
      json_schema: jsonSchemaForOpenAI,
    },
  });

  if (!completion.choices[0].message.content) {
    throw new Error("No response");
  }

  try {
    return zod.parse(JSON.parse(completion.choices[0].message.content)) as T;
  } catch (error: any) {
    console.error(completion.choices[0].message.content);
    throw error;
  }
}
