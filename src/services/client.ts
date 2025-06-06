import OpenAI from "openai";
import { modelLoader } from "./models.js";
import { BookMakerConfig } from "../types/standard.js";

export async function getClient(config: BookMakerConfig) {
    const model = modelLoader(config);

    return new OpenAI({
        apiKey: model.apiKey,
        baseURL: model.baseUrl,
    });
}
