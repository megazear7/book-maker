
import { promises as fs } from "fs";
import { BookMakerConfig, ChapterOutline, Prompt, Role } from "./types/standard.js";
import { getReferences } from "./services/get-references.js";
import { getClient } from "./services/xai-auth.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getOverview } from "./services/get-overview.js";
import { promptToMessage } from "./services/prompt-to-message.js";
import { getCompletion } from "./services/get-completion.js";
import { getChapters } from "./services/get-chapters.js";
import { getNextChapterPrompt } from "./services/get-next-chapter-prompt.js";
import { getJsonCompletion } from "./services/get-json-completion.js";
import { getPartPrompt } from "./services/get-part-prompt.js";
import { getNextChapter } from "./services/get-next-chapter.js";

// Refer to the below grok chat for example process and prompts
// https://grok.com/chat/8a266bc2-ecb7-4c2c-bde0-128b7a01d132

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
    console.log(`Writing chapter ${nextChapter.title}`);
    messages.push(...promptToMessage(Role.enum.user, getNextChapterPrompt(nextChapter)));
    const parts = await getJsonCompletion(client, messages, ChapterOutline);
    const writtenParts: string[] = [];

    for (let j = 0; j < parts.length; j++) {
        const part = parts[j];
        console.log(`  Writing part ${j+1}: ${part.title}`);
        messages.push(...promptToMessage(Role.enum.user, getPartPrompt(nextChapter, j+1)));
        writtenParts.push(await getCompletion(client, messages));
    }

    fs.mkdir(`data/${config.book}/chapters/chapter-${nextChapter.index}`);
    fs.writeFile(`data/${config.book}/chapters/chapter-${nextChapter.index}/chapter-${nextChapter.index}.json`, JSON.stringify(parts, undefined, 4));
    fs.writeFile(`data/${config.book}/chapters/chapter-${nextChapter.index}/chapter-${nextChapter.index}.txt`, writtenParts.join('\n'));

    index++;
    nextChapter = await getNextChapter(config);
}



// Step 4: For the next chapter, use the chapter outliner to create a chapter outline

// Step 5: Use the part writer to write the parts for each chapter
