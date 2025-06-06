
import { promises as fs } from "fs";
import { BookMakerConfig, ChapterOutline, Role } from "./types/standard.js";
import { getClient } from "./services/client.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getOverview } from "./services/get-overview.js";
import { promptToMessage } from "./services/prompt-to-message.js";
import { getCompletion } from "./services/get-completion.js";
import { getChapters } from "./services/get-chapters.js";
import { getNextChapterPrompt } from "./services/get-next-chapter-prompt.js";
import { getJsonCompletion } from "./services/get-json-completion.js";
import { getPartPrompt } from "./services/get-part-prompt.js";
import { getNextChapter } from "./services/get-next-chapter.js";
import { logMessages } from "./services/log-messages.js";
import { getReferences } from "./services/get-references.js";

const client = await getClient();
const config = BookMakerConfig.parse(JSON.parse(await fs.readFile("book-maker.config.json", "utf-8")));
const references = await getReferences(config);
const overview = await getOverview(config);
const chapters = await getChapters(config);
const messages: Array<ChatCompletionMessageParam> = [
    ...promptToMessage(Role.enum.system, references),
    ...promptToMessage(Role.enum.system, overview),
    ...promptToMessage(Role.enum.system, chapters),
];

let index = 0;
let nextChapter = await getNextChapter(config);

while (index < 1 && nextChapter) {
    console.log(`Writing chapter ${nextChapter.index} to be between ${nextChapter.parts.min} and ${nextChapter.parts.max} parts: ${nextChapter.title}`);
    messages.push(...promptToMessage(Role.enum.user, getNextChapterPrompt(nextChapter)));
    const { parts } = await getJsonCompletion(client, messages, ChapterOutline);
    messages.push(...promptToMessage(Role.enum.assistant, JSON.stringify(parts, undefined, 4)));
    await logMessages(messages);
    await fs.mkdir(`data/${config.book}/chapters/chapter-${nextChapter.index}`, { recursive: true });
    await fs.writeFile(`data/${config.book}/chapters/chapter-${nextChapter.index}/chapter-${nextChapter.index}.json`, JSON.stringify(parts, undefined, 4));

    const writtenParts: string[] = [];
    for (let j = 0; j < parts.length; j++) {
        const part = parts[j];
        console.log(`  Writing part ${j+1} to be about ${nextChapter.parts.length} words long: ${part.title}`);
        messages.push(...promptToMessage(Role.enum.user, getPartPrompt(nextChapter, j+1)));
        const partText = await getCompletion(client, messages);
        messages.push(...promptToMessage(Role.enum.assistant, partText));
        await logMessages(messages);
        writtenParts.push(partText);
        await fs.writeFile(`data/${config.book}/chapters/chapter-${nextChapter.index}/chapter-${nextChapter.index}.txt`, writtenParts.join('\n'));
    }

    index++;
    nextChapter = await getNextChapter(config);
}
