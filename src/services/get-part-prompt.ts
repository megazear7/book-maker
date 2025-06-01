import { partWriterPrompt } from "../prompts/01-part-writer.js";
import { ChapterSummary, Prompt } from "../types/standard.js";

export function getPartPrompt(ChapterSummary: ChapterSummary, part: number): Prompt {
    const chapter = ChapterSummary.title;
    const length = 800;
    return partWriterPrompt({ chapter, part, length });
}
