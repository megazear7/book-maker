import { ChatCompletionMessageParam } from "openai/resources";
import { Prompt, Role } from "../types/standard.js";

export function promptToMessage(role: Role, input: Prompt | Prompt[]): Array<ChatCompletionMessageParam> {
    if (Array.isArray(input)) {
        const prompts = Prompt.array().parse(input);
        return prompts.map(content => ({ role, content }));
    } else {
        const content = Prompt.parse(input);
        return [{ role, content }];
    }
}
