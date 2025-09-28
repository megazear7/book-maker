import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from "openai/resources";
import { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { Book } from "../types/book.type.js";
import { getTextModelConfig } from "./get-model-config.js";
import { writeBook } from "./write-book.js";

export async function getJsonCompletion<T>(
  book: Book,
  client: OpenAI,
  history: ChatCompletionMessageParam[],
  zod?: ZodSchema<T>,
): Promise<T> {
  const modelConfig = getTextModelConfig(book);
  const config: ChatCompletionCreateParamsNonStreaming = {
    model: modelConfig.modelName,
    messages: history,
    max_completion_tokens: 10000,
  };

  if (zod) {
    const innerSchema = zodToJsonSchema(zod);
    const jsonSchemaForOpenAI = {
      name: "schema",
      schema: innerSchema.definitions?.Article || innerSchema,
      strict: true,
    };
    config.response_format = {
      type: "json_schema",
      json_schema: jsonSchemaForOpenAI,
    };
  }

  const completion = await client.chat.completions.create(config);

  if (!completion.choices[0].message.content) {
    throw new Error("No response");
  }

  if (book.model.text.cost) {
    book.model.text.usage.completion_tokens +=
      completion.usage?.completion_tokens || 0;
    book.model.text.usage.prompt_tokens += completion.usage?.prompt_tokens || 0;
    if (
      completion.usage &&
      completion.usage.completion_tokens &&
      completion.usage?.prompt_tokens
    ) {
      const addedCost =
        completion.usage.completion_tokens *
          (book.model.text.cost.outputTokenCost / 1000000) +
        completion.usage.prompt_tokens *
          (book.model.text.cost.inputTokenCost / 1000000);
      console.log("Added cost: " + addedCost, completion.usage);
    } else {
      console.log("No usage info returned: ", completion.usage);
    }

    await writeBook(book);
  }

  try {
    if (zod) {
      return zod.parse(JSON.parse(completion.choices[0].message.content));
    } else {
      return completion.choices[0].message.content as T;
    }
  } catch (error) {
    console.error(completion.choices[0].message.content);
    throw error;
  }
}
