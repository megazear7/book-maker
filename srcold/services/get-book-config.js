import { promises as fs } from "fs";
import { BookConfig } from "../types/standard.js";
export async function getBookConfig(config) {
    const txt = await fs.readFile(`data/${config.book}/book.json`, "utf-8");
    const json = JSON.parse(txt);
    return BookConfig.parse(json);
}
//# sourceMappingURL=get-book-config.js.map