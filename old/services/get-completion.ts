import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { modelLoader } from "./models.js";
import { BookMakerConfig } from "../types/standard.js";

export async function getCompletion(config: BookMakerConfig, client: OpenAI, history: Array<ChatCompletionMessageParam>) {
  const model = modelLoader(config);

  const completion = await client.chat.completions.create({
    model: model.name,
    messages: history,
  });

  if (!completion.choices[0].message.content) {
    throw new Error("Failed to get completion");
  }

  return completion.choices[0].message.content;
}
