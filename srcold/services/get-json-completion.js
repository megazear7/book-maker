import zodToJsonSchema from "zod-to-json-schema";
import { modelLoader } from "./models.js";
export async function getJsonCompletion(config, client, history, zod) {
    const model = modelLoader(config);
    const innerSchema = zodToJsonSchema(zod);
    const jsonSchemaForOpenAI = {
        name: "schema",
        schema: innerSchema.definitions?.Article || innerSchema,
        strict: true
    };
    const completion = await client.chat.completions.create({
        model: model.name,
        messages: history,
        //reasoning_effort: "high",
        response_format: {
            type: "json_schema",
            json_schema: jsonSchemaForOpenAI,
        },
    });
    if (!completion.choices[0].message.content) {
        throw new Error("No response");
    }
    try {
        return zod.parse(JSON.parse(completion.choices[0].message.content));
    }
    catch (error) {
        console.error(completion.choices[0].message.content);
        throw error;
    }
}
//# sourceMappingURL=get-json-completion.js.map