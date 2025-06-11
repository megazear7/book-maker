import { Prompt } from "../types/standard.js";
export function promptToMessage(role, input) {
    if (Array.isArray(input)) {
        const prompts = Prompt.array().parse(input);
        return prompts.map(content => ({ role, content }));
    }
    else {
        const content = Prompt.parse(input);
        return [{ role, content }];
    }
}
//# sourceMappingURL=prompt-to-message.js.map