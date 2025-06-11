import { promises as fs } from "fs";
import { BookMakerConfig } from "./types/standard.js";
import { getChapters } from "./services/get-chapters.js";
import { createAudio } from "./services/create-audio.js";
const config = BookMakerConfig.parse(JSON.parse(await fs.readFile("book-maker.config.json", "utf-8")));
const chapters = await getChapters(config);
for (let chapterIndex = 1; chapterIndex <= chapters.length; chapterIndex++) {
    console.log(`Editing audio for chapter ${chapterIndex}`);
    const chapterTextFilePath = `data/${config.book}/chapters/chapter-${chapterIndex}/chapter-${chapterIndex}.txt`;
    const chapterText = await fs.readFile(chapterTextFilePath, "utf-8");
    await createAudio(config, chapterIndex, chapterText, true);
    // TODO: Remove this to edit the whole book.
    break;
}
//# sourceMappingURL=edit-audio.js.map