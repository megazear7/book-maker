import OpenAI, { AzureOpenAI } from "openai";
import { Book, KnownModelTypeName } from "../types/book.type.js";
import { getTextModelConfig } from "./get-model-config.js";

export async function getTextClient(book: Book) {
  const modelConfig = getTextModelConfig(book);

  if (book.model.text.name === KnownModelTypeName.enum.azure) {
    return new AzureOpenAI({
      endpoint: modelConfig.endpoint,
      apiKey: modelConfig.apiKey,
      apiVersion: "2024-08-01-preview",
      deployment: modelConfig.deployment,
    });
  }

  return new OpenAI({
    baseURL: modelConfig.endpoint,
    apiKey: modelConfig.apiKey,
  });
}
