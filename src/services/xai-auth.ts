import OpenAI from "openai";
import { XAI_API_KEY } from "../config.js";

export async function getClient() {
    return new OpenAI({
        apiKey: XAI_API_KEY,
        baseURL: "https://api.x.ai/v1",
    });
}
