import { BookByChapters, BookMakerConfig, ChapterSummaryWithIndex } from "../types/standard.js";
import { promises as fs } from "fs";
import { getExistingChapterNames } from "./get-existing-chapter-names.js";

export async function getNextChapter(config: BookMakerConfig): Promise<ChapterSummaryWithIndex | undefined> {
    const existingChapterNames = await getExistingChapterNames(config);
    const txt = await fs.readFile(`data/${config.book}/chapter-outline.json`, "utf-8");
    const json = JSON.parse(txt);
    const chapters = BookByChapters.parse(json);
    const index = 1;
    for (const chapter of chapters.chapters) {
        if (!existingChapterNames.includes(`chapter-${index}`)) {
            return {
                index: index,
                ...chapter,
            };
        }
    }

    return undefined;
}
