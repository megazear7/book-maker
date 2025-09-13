import {
    Book,
    BookId,
    Chapter,
    ChapterNumber,
    ChapterParts,
} from "../types/book.type.js";
import { getAudioClient } from "./client.js";
import { getBook } from "./get-book.js";
import { writeBook } from "./write-book.js";
import { promises as fs } from "fs";

export async function createChapterAudio(
    bookId: BookId,
    chapterNumber: ChapterNumber,
): Promise<ChapterParts> {
    const book: Book = await getBook(bookId);
    const chapter: Chapter = book.chapters[chapterNumber - 1];
    const client = await getAudioClient(book);

    for (let partIndex = 0; partIndex < chapter.parts.length; partIndex++) {
        const response = await client.chat.completions.create({
            model: "gpt-4o-audio-preview-2025-06-03",
            modalities: ["text", "audio"],
            max_completion_tokens: 15000,
            audio: {
                voice: "ash", // Preview voice options here: https://www.openai.fm/
                format: "mp3",
            },
            messages: [
                {
                    role: "system",
                    content: `You are a professional audio book narrator. You repeat the provided text exactly as written. ${book.instructions.audio}`,
                },
                {
                    role: "user",
                    content: chapter.parts[partIndex].text,
                },
                {
                    role: "user",
                    content: "Please speak the above text exactly as written",
                }
            ]
        });
        const audio = response.choices[0].message.audio?.data;
        if (!audio) {
            throw new Error("No audio data returned in the response");
        }
        const buffer = Buffer.from(audio, "base64");
        const id = crypto.randomUUID();
        await fs.mkdir(`books/book.${book.id}.audio`, { recursive: true });
        await fs.writeFile(`books/book.${book.id}.audio/${id}.mp3`, buffer);
        chapter.parts[partIndex].audio = id;
    }

    await writeBook(book);

    return chapter.parts;
}
