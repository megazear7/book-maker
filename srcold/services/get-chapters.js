import { promises as fs } from "fs";
import { exists } from "./fs.js";
export async function getChapters(config) {
    const chapters = [];
    const chapterNames = await fs.readdir(`data/${config.book}/chapters`);
    for (const name of chapterNames) {
        const chapterTxtPath = `data/${config.book}/chapters/${name}/${name}.txt`;
        if (await exists(chapterTxtPath)) {
            const number = name.split('chapter-')[0];
            const txt = await fs.readFile(chapterTxtPath, "utf-8");
            chapters.push(`${txt}\n\n\n\nThe above is chapter ${number} from the in progress book called ${config.title}`);
        }
    }
    return chapters;
}
//# sourceMappingURL=get-chapters.js.map