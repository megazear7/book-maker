import { partWriterPrompt } from "../prompts/01-part-writer.js";
export function getPartPrompt(chapterSummary, part) {
    const chapter = chapterSummary.title;
    const length = chapterSummary.parts.length;
    return partWriterPrompt({ chapter, part, length });
}
//# sourceMappingURL=get-part-prompt.js.map