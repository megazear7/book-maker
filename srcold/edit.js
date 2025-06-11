import { promises as fs } from "fs";
import { BookMakerConfig, Role } from "./types/standard.js";
import { getClient } from "./services/client.js";
import { getOverview } from "./services/get-overview.js";
import { promptToMessage } from "./services/prompt-to-message.js";
import { getCompletion } from "./services/get-completion.js";
import { getChapters } from "./services/get-chapters.js";
import { editorPrompt } from "./prompts/03-editor.js";
import { createAudio } from "./services/create-audio.js";
const config = BookMakerConfig.parse(JSON.parse(await fs.readFile("book-maker.config.json", "utf-8")));
const instructions = await fs.readFile(`data/${config.book}/edit-instructions.txt`, "utf-8");
const client = await getClient(config);
//const references = await getReferences(config);
const overview = await getOverview(config);
const chapters = await getChapters(config);
const messages = [
    //    ...promptToMessage(Role.enum.system, references),
    ...promptToMessage(Role.enum.system, overview),
    ...promptToMessage(Role.enum.system, chapters),
];
for (let chapterIndex = 1; chapterIndex <= chapters.length; chapterIndex++) {
    console.log(`Editing chapter ${chapterIndex}`);
    const chapterTextFilePath = `data/${config.book}/chapters/chapter-${chapterIndex}/chapter-${chapterIndex}.txt`;
    const oldChapterTextFilePath = `data/${config.book}/chapters/chapter-${chapterIndex}/chapter-${chapterIndex}-old.txt`;
    const chapterText = await fs.readFile(chapterTextFilePath, "utf-8");
    await fs.writeFile(oldChapterTextFilePath, chapterText.trim());
    const oldLines = chapterText.split('\n').map(line => line.trim()).filter(line => !!line);
    const newLines = [];
    for (let j = 0; j < oldLines.length; j++) {
        const oldLine = oldLines[j];
        console.log(`  Editing line ${j + 1} of chapter ${chapterIndex}`);
        newLines.push(await editLine(oldLine));
        await fs.writeFile(chapterTextFilePath, newLines.join('\n').trim());
    }
    await createAudio(config, chapterIndex, chapterText, true);
    // TODO: Remove this to edit the whole book.
    break;
}
async function editLine(oldLine) {
    const editMessages = [
        ...messages,
        ...promptToMessage(Role.enum.user, editorPrompt(instructions, oldLine)),
    ];
    return getCompletion(config, client, editMessages);
    ;
}
//# sourceMappingURL=edit.js.map