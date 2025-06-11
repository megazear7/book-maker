import { exists } from "./fs.js";
import { promises as fs } from "fs";
export async function getExistingChapterNames(config) {
    const names = [];
    const dirs = await fs.readdir(`data/${config.book}/chapters`);
    for (const name of dirs) {
        const chapterTxtPath = `data/${config.book}/chapters/${name}/${name}.txt`;
        if (await exists(chapterTxtPath)) {
            names.push(name);
        }
    }
    return names;
}
//# sourceMappingURL=get-existing-chapter-names.js.map