import { Book } from "../types/book.type.js";
import { env, envOptional } from "./env.js";

export function getTextModelConfig(book: Book) {
  return {
    endpoint: env(`${book.model.text.name.toUpperCase()}_BASE_URL`),
    apiKey: env(`${book.model.text.name.toUpperCase()}_API_KEY`),
    modelName: env(`${book.model.text.name.toUpperCase()}_MODEL_NAME`),
    deployment: envOptional(`${book.model.text.name.toUpperCase()}_DEPLOYMENT`),
  };
}

export function getAudioModelConfig(book: Book) {
  return {
    endpoint: env(`${book.model.audio.name.toUpperCase()}_BASE_URL`),
    apiKey: env(`${book.model.audio.name.toUpperCase()}_API_KEY`),
    modelName: env(`${book.model.audio.name.toUpperCase()}_MODEL_NAME`),
    deployment: envOptional(`${book.model.audio.name.toUpperCase()}_DEPLOYMENT`),
  };
}
