import { BookMakerConfig } from "../types/standard.js";
import { makeAudio } from "./audio.js";
import { concatAudio } from "./concat-audio.js";
import { exists } from "./fs.js";
import { getBookConfig } from "./get-book-config.js";

export async function createAudio(config: BookMakerConfig, chapterIndex: number, chapterText: string, overwrite: boolean = false) {
    const bookConfig = await getBookConfig(config);
    const chapter = bookConfig.chapters[chapterIndex - 1];
    const finalAudioFilePath = `data/${config.book}/chapters/chapter-${chapterIndex}/chapter-${chapterIndex}.${config.audio.format}`;

    console.log(`Creating audio for chapter ${chapterIndex}`);

    if (config.audio.lineByLine) {
        const files: string[] = [];
        const lines = chapterText.split('\n').map(line => line.trim()).filter(line => !!line);
        for (let j = 1; j <= lines.length; j++) {
            const lineText = lines[j-1];
            const audioFilePath = `data/${config.book}/chapters/chapter-${chapterIndex}/chapter-${chapterIndex}-line-${j}.${config.audio.format}`;
            if (!overwrite && await exists(audioFilePath)) {
                console.log(`  Chapter audio already created for line ${j} of chapter ${chapterIndex}`);
            } else {
                console.log(`  Creating chapter audio for line ${j} of chapter ${chapterIndex}`);
                await makeAudio(config, audioFilePath, lineText);
            }
            files.push(audioFilePath);
        }

        console.log(`  Creating the concatenated audio file for chapter ${chapterIndex}`);
        await concatAudio(files, finalAudioFilePath);
    } else {
        if (!overwrite && await exists(finalAudioFilePath)) {
            console.log(`  Chapter audio already created for ${chapter.title}`);
        } else {
            console.log(`  Creating chapter audio for ${chapter.title}`);
            await makeAudio(config, finalAudioFilePath, chapterText);
        }
    }
}