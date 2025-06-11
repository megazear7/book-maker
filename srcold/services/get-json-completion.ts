import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { modelLoader } from "./models.js";
import { BookMakerConfig } from "../types/standard.js";

export async function getJsonCompletion<T>(config: BookMakerConfig, client: OpenAI, history: Array<ChatCompletionMessageParam>, zod: ZodSchema<T>): Promise<T> {
  const model = modelLoader(config);
  const innerSchema = zodToJsonSchema(zod);
  const jsonSchemaForOpenAI = {
    name: "schema",
    schema: innerSchema.definitions?.Article || innerSchema,
    strict: true
  };

  const completion = await client.chat.completions.create({
    model: model.name,
    messages: history,
    //reasoning_effort: "high",
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
