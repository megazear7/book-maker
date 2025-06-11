import OpenAI from "openai";
import { modelLoader } from "./models.js";
export async function getClient(config) {
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
//# sourceMappingURL=client.js.map