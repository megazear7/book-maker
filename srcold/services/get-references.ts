import { referencesPrompt } from "../prompts/00-references.js";
import { BookMakerConfig, Prompt } from "../types/standard.js";
import { promises as fs } from "fs";

export async function getReferences(config: BookMakerConfig): Promise<Prompt[]> {
    const references: Prompt[] = [];

    for (const ref of config.references) {
        const txt = await fs.readFile(`data/${ref}/book.txt`, "utf-8");
        const prompt = await fs.readFile(`data/${ref}/prompt.txt`, "utf-8");
        references.push(`${referencesPrompt()}\n\n\n\n${txt}\n\n\n\n${prompt}`);
    }

    return references;
}
