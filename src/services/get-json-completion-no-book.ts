import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { env } from "./env.js";

export async function getJsonCompletionNoBook<T>(
  history: ChatCompletionMessageParam[],
  zod: ZodSchema<T>,
): Promise<T> {
  const client = new OpenAI({
    baseURL: "https://api.x.ai/v1",
    apiKey: env(`GROK_MODEL_API_KEY`),
  });
  const innerSchema = zodToJsonSchema(zod);
  const jsonSchemaForOpenAI = {
    name: "schema",
    schema: innerSchema.definitions?.Article || innerSchema,
    strict: true,
  };
  const completion = await client.chat.completions.create({
    model: "grok-4-0709",
    messages: history,
    max_completion_tokens: 10000,
    response_format: {
      type: "json_schema",
      json_schema: jsonSchemaForOpenAI,
    },
  });

  if (!completion.choices[0].message.content) {
    throw new Error("No response");
  }

  try {
    return zod.parse(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error(completion.choices[0].message.content);
    throw error;
  }
}
