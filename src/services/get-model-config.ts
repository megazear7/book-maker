import { Book } from "../types/book.type.js";
import { env } from "./env.js";

export function getTextModelConfig(book: Book): {
  endpoint: string;
  apiKey: string;
  modelName: string;
  deployment: string | undefined;
} {
  return {
    endpoint: book.model.text.endpoint,
    apiKey: env(`${book.model.text.name.toUpperCase()}_MODEL_API_KEY`),
    modelName: book.model.text.modelName,
    deployment: book.model.text.deployment,
  };
}

export function getAudioModelConfig(book: Book): {
  endpoint: string;
  apiKey: string;
  modelName: string;
  deployment: string | undefined;
} {
  return {
    endpoint: book.model.audio.endpoint,
    apiKey: env(`${book.model.audio.name.toUpperCase()}_MODEL_API_KEY`),
    modelName: book.model.audio.modelName,
    deployment: book.model.audio.deployment,
  };
}
