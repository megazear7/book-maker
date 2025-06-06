import { BookMakerConfig } from "../types/standard.js";
import { env } from "./env.js";

export const models = {
    grok: () => ({
        name: env("GROK_MODEL_NAME"),
        apiKey: env("GROK_API_KEY"),
        baseUrl: env("GROK_BASE_URL"),
    }),
    gpt: () => ({
        // Once 7 days have passed I can use gpt-4.1-long-context and
        // update the admin panel to allow for more tokens per minute.
        name: env("OPENAI_MODEL_NAME"),
        apiKey: env("OPENAI_API_KEY"),
        baseUrl: env("OPENAI__BASE_URL"),
    }),
    azure: () => ({
        name: env("AZURE_MODEL_NAME"),
        apiKey: env("AZURE_API_KEY"),
        baseUrl: env("AZURE_BASE_URL"),
    }),
}

export const modelLoader = (config: BookMakerConfig) => {
    return models[config.model]();
}
