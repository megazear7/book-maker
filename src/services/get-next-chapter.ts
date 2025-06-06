import { BookMakerConfig, ChapterSummaryWithIndex } from "../types/standard.js";
import { getExistingChapterNames } from "./get-existing-chapter-names.js";
import { getBookConfig } from "./get-book-config.js";

export async function getNextChapter(config: BookMakerConfig): Promise<ChapterSummaryWithIndex | undefined> {
    const existingChapterNames = await getExistingChapterNames(config);
    const chapters = await getBookConfig(config);
    let index = 1;
    for (const chapter of chapters.chapters) {
        if (!existingChapterNames.includes(`chapter-${index}`)) {
            return {
                index: index,
                ...chapter,
            };
        }
        index++;
    }

    return undefined;
}
