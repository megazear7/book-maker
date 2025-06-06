import OpenAI from "openai";
import { model } from "./models.js";

export async function getClient() {
    return new OpenAI({
        apiKey: model.apiKey,
        baseURL: model.baseUrl,
    });
}
