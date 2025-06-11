export function editorPrompt(instructions, line) {
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
//# sourceMappingURL=03-editor.js.map