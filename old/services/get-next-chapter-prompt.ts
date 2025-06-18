import { ChapterSummary, Prompt } from "../types/standard.js";
import { chapterOutlinerPrompt } from "../prompts/02-chapter-outliner.js";

export function getNextChapterPrompt(chapter: ChapterSummary): Prompt {
    return `${chapter.title}\nWhen: ${chapter.when}\nWhere: ${chapter.where}\nWhat: ${chapter.what}\nWhy: ${chapter.why}\nHow: ${chapter.how}\nWho: ${chapter.who}\n\n${chapterOutlinerPrompt(chapter.title, chapter.parts.min, chapter.parts.max)}`;
}
