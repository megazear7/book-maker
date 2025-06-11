import { modelLoader } from "./models.js";
export async function getCompletion(config, client, history) {
    const model = modelLoader(config);
    const completion = await client.chat.completions.create({
        model: model.name,
        messages: history,
    });
    if (!completion.choices[0].message.content) {
        throw new Error("Failed to get completion");
    }
    return completion.choices[0].message.content;
}
//# sourceMappingURL=get-completion.js.map