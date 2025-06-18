import OpenAI, { AzureOpenAI } from "openai";
import { modelLoader } from "./models.js";
import { BookMakerConfig } from "../types/standard.js";

export async function getClient(config: BookMakerConfig) {
    const model = modelLoader(config);

    return new OpenAI({
        apiKey: model.key,
        baseURL: model.url,
    });

    // return new AzureOpenAI({
    //     endpoint: model.url,
    //     apiKey: model.key,
    //     apiVersion: "2024-08-01-preview",
    //     deployment: "gpt-4.1"
    // });
}
