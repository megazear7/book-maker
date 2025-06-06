import { XAI_API_KEY, OPENAI_API_KEY } from "../config.js";

export const models = {
    grok: {
        name: "grok-3",
        apiKey: XAI_API_KEY,
        baseUrl: "https://api.x.ai/v1",
    },
    // Once 7 days have passed I can use gpt-4.1-long-context and
    // update the admin panel to allow for more tokens per minute.
    gpt: {
        name: "gpt-4.1",
        apiKey: OPENAI_API_KEY,
        baseUrl: "https://api.openai.com/v1",
    }
}

export const model = models.gpt;
