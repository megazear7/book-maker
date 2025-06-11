import { Prompt } from "../types/standard";

export function editorPrompt(instructions: string, line: string): Prompt {
  return `
Instructions:
${instructions}

--------

Text to edit:
${line}

--------

I want you to edit the provided text based on the instructions provided above.
`.trim();
}
