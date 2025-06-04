import { Prompt } from "../types/standard";

export function chapterOutlinerPrompt(chapter: string, min: number, max: number): Prompt {
  return `I want you to outline the "${chapter}" chapter into 3 to 5 distinct parts.`;
}
