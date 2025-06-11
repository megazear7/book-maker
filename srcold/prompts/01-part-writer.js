import z from "zod";
export const PartWriterPromptParams = z.object({
    chapter: z
        .string()
        .min(1)
        .describe("The chapter title you want the ai to write"),
    part: z
        .number()
        .int()
        .min(1)
        .describe("The part of the chapter you want the ai to write."),
    length: z
        .number()
        .int()
        .min(1)
        .describe("The length in words of this part of the chapter"),
});
export function partWriterPrompt({ chapter, part, length }) {
    return `
I want you to write part ${part} of the "${chapter}" scene as though you are an amazing author with subtly and nuance.
It should be about ${length} words in length.
Remember to match the writing style of the author based on the existing written material provided earlier. 

Only reply with the text of the part with no additional commentary, no formtting, no headers, and no other text.
`.trim();
}
//# sourceMappingURL=01-part-writer.js.map