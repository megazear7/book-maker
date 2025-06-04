import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

export async function getCompletion(client: OpenAI, history: Array<ChatCompletionMessageParam>) {
  const completion = await client.chat.completions.create({
    model: "grok-3",
    messages: history,
  });

  if (!completion.choices[0].message.content) {
    throw new Error("Failed to get completion");
  }

  return completion.choices[0].message.content;
}
