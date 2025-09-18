import { Book, BookId } from "../types/book.type.js";
import { getBook } from "./get-book.js";
import { getChapterPartAudioId } from "./get-chapter-part-audio-id.js";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";
import ffmpeg from "fluent-ffmpeg";
import pathToFfmpeg from "ffmpeg-static";

ffmpeg.setFfmpegPath(pathToFfmpeg!);
console.log("[AUDIO] Using ffmpeg binary at:", pathToFfmpeg);

export async function getBookAudio(bookId: BookId): Promise<Readable> {
  const book: Book = await getBook(bookId);
  const audioPaths: string[] = [];
  const audioPath = `books/book.${book.id}.audio/combined.mp3`;
  for (const chapter of book.chapters) {
    for (let i = 0; i < chapter.parts.length; i++) {
      const partNumber = i + 1;
      const audioId = await getChapterPartAudioId(
        book.id,
        chapter.number,
        partNumber,
      );
      const audioPath = `books/book.${book.id}.audio/${audioId}.mp3`;
      try {
        await fs.stat(audioPath);
        audioPaths.push(audioPath);
      } catch {
        // Stop at the first missing audio file
        try {
          await combineMP3Files(audioPaths, audioPath);
        } catch (err) {
          console.error("Failed to combine MP3 files:", err);
          throw err;
        }
        return createReadStream(audioPath);
      }
    }
  }

  try {
    await combineMP3Files(audioPaths, audioPath);
  } catch (err) {
    console.error("Failed to combine MP3 files:", err);
    throw err;
  }
  return createReadStream(audioPath);
}

async function combineMP3Files(
  inputFiles: string[],
  outputFile: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    inputFiles.forEach((file) => {
      command.input(file);
    });
    command
      .complexFilter([
        {
          filter: "concat",
          options: { n: inputFiles.length, v: 0, a: 1 },
          inputs: inputFiles.map((_, i) => `${i}:a`),
          outputs: "a",
        },
      ])
      .outputOptions("-map", "[a]")
      .on("stderr", (line) => console.error("[ffmpeg]", line))
      .on("end", () => resolve())
      .on("error", (err) => reject(`Error: ${err.message}`))
      .save(outputFile);
  });
}
