import OpenAI from "openai";
import { XAI_API_KEY } from "./config";

const client = new OpenAI({
  apiKey: XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const completion = await client.chat.completions.create({
  model: "grok-3",
  messages: [{ role: "user", content: "What is the 2+2?" }],
});

console.log(completion.choices[0].message.content);
