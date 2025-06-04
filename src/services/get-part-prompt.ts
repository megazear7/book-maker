import { partWriterPrompt } from "../prompts/01-part-writer.js";
import { ChapterSummary, Prompt } from "../types/standard.js";

export function getPartPrompt(chapterSummary: ChapterSummary, part: number): Prompt {
    const chapter = chapterSummary.title;
    const length = chapterSummary.parts.length;
    return partWriterPrompt({ chapter, part, length });
}
