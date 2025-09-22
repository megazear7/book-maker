import OpenAI, { AzureOpenAI } from "openai";
import { Book } from "../types/book.type.js";
import { getAudioModelConfig, getTextModelConfig } from "./get-model-config.js";

export async function getTextClient(book: Book): Promise<OpenAI> {
  const modelConfig = getTextModelConfig(book);

  if (book.model.text.name === "azure") {
    return new AzureOpenAI({
      endpoint: modelConfig.endpoint,
      apiKey: modelConfig.apiKey,
      apiVersion: "2024-08-01-preview",
      deployment: modelConfig.deployment,
    });
  } else {
    return new OpenAI({
      baseURL: modelConfig.endpoint,
      apiKey: modelConfig.apiKey,
    });
  }
}

export async function getAudioClient(book: Book): Promise<OpenAI> {
  const modelConfig = getAudioModelConfig(book);

  if (book.model.audio.name === "azure") {
    return new AzureOpenAI({
      endpoint: modelConfig.endpoint,
      apiKey: modelConfig.apiKey,
      apiVersion: "2024-08-01-preview",
      deployment: modelConfig.deployment,
    });
  } else {
    return new OpenAI({
      baseURL: modelConfig.endpoint,
      apiKey: modelConfig.apiKey,
    });
  }
}
