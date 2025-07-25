
import { promises as fs } from "fs";
import { BookMakerConfig, ChapterOutline, ChapterOutlinePart, Role } from "./types/standard.js";
import { getClient } from "./services/client.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getOverview } from "./services/get-overview.js";
import { promptToMessage } from "./services/prompt-to-message.js";
import { getCompletion } from "./services/get-completion.js";
import { getChapters } from "./services/get-chapters.js";
import { getNextChapterPrompt } from "./services/get-next-chapter-prompt.js";
import { getJsonCompletion } from "./services/get-json-completion.js";
import { getPartPrompt } from "./services/get-part-prompt.js";
import { logMessages } from "./services/log-messages.js";
import { getReferences } from "./services/get-references.js";
import { getBookConfig } from "./services/get-book-config.js";
import { exists } from "./services/fs.js";
import { createAudio } from "./services/create-audio.js";

const config = BookMakerConfig.parse(JSON.parse(await fs.readFile("book-maker.config.json", "utf-8")));
const client = await getClient(config);
//const references = await getReferences(config);
const overview = await getOverview(config);
const chapters = await getChapters(config);
const messages: Array<ChatCompletionMessageParam> = [
    //...promptToMessage(Role.enum.system, references),
    ...promptToMessage(Role.enum.system, overview),
    ...promptToMessage(Role.enum.system, chapters),
];

let chapterIndex = 1;

while (chapterIndex < chapters.length) {
    const parts = await createOutline(chapterIndex);
    const chapterText = await createChapter(chapterIndex, parts);
    await createAudio(config, chapterIndex, chapterText);

    // TODO: Remove this to complete the whole book.
    break;
}

async function createOutline(chapterIndex: number): Promise<ChapterOutlinePart[]> {
    const outlineFilePath = `data/${config.book}/chapters/chapter-${chapterIndex}/chapter-${chapterIndex}.json`;
    const bookConfig = await getBookConfig(config);
    const chapter = bookConfig.chapters[chapterIndex - 1];

    if (await exists(outlineFilePath)) {
        console.log(`Chapter ${chapterIndex} exists: ${chapter.title}`);
        const file = await fs.readFile(outlineFilePath, "utf-8");
        const json = JSON.parse(file);
        return ChapterOutlinePart.array().parse(json);
    } else {
        console.log(`Writing chapter ${chapterIndex} to be between ${chapter.parts.min} and ${chapter.parts.max} parts: ${chapter.title}`);
        messages.push(...promptToMessage(Role.enum.user, getNextChapterPrompt(chapter)));
        const { parts } = await getJsonCompletion(config, client, messages, ChapterOutline);
        messages.push(...promptToMessage(Role.enum.assistant, JSON.stringify(parts, undefined, 4)));
        await logMessages(messages);
        await fs.mkdir(`data/${config.book}/chapters/chapter-${chapterIndex}`, { recursive: true });
        await fs.writeFile(outlineFilePath, JSON.stringify(parts, undefined, 4));
        return parts;
    }
}

async function createChapter(chapterIndex: number, parts: ChapterOutlinePart[]): Promise<string> {
    const chapterTextFilePath = `data/${config.book}/chapters/chapter-${chapterIndex}/chapter-${chapterIndex}.txt`;
    const bookConfig = await getBookConfig(config);
    const chapter = bookConfig.chapters[chapterIndex - 1];

    if (await exists(chapterTextFilePath)) {
        console.log(`Chapter already written: ${chapter.title}`);
        return fs.readFile(chapterTextFilePath, "utf-8");
    } else {
        const writtenParts: string[] = [];
        for (let j = 0; j < parts.length; j++) {
            const part = parts[j];
            console.log(`  Writing part ${j+1} to be about ${chapter.parts.length} words long: ${part.title}`);
            messages.push(...promptToMessage(Role.enum.user, getPartPrompt(chapter, j+1)));
            const partText = await getCompletion(config, client, messages);
            messages.push(...promptToMessage(Role.enum.assistant, partText));
            await logMessages(messages);
            writtenParts.push(partText);
            await fs.writeFile(`data/${config.book}/chapters/chapter-${chapterIndex}/chapter-${chapterIndex}.txt`, writtenParts.join('\n'));
        }
        return writtenParts.join('\n');
    }
}
