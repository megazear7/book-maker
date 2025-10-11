import { Book, BookId, Chapter } from "../types/book.type.js";
import { getBook } from "./get-book.js";
import { getChapterPartAudioId } from "./get-chapter-part-audio-id.js";
import { getAudioClient } from "./client.js";
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
    // Add chapter introduction only if includeChapterTitles is true
    if (book.details?.includeChapterTitles) {
      const introId = await generateChapterIntro(book, chapter);
      const introPath = `books/book.${book.id}.audio/${introId}.mp3`;
      audioPaths.push(introPath);

      // Add longer pause after chapter introduction
      const longPauseId = await createSilence(2.0); // 2 second pause
      const longPausePath = `books/silence/${longPauseId}.mp3`;
      audioPaths.push(longPausePath);
    }

    for (let i = 0; i < chapter.parts.length; i++) {
      const partNumber = i + 1;
      const audioId = await getChapterPartAudioId(
        book.id,
        chapter.number,
        partNumber,
      );

      // Skip parts that don't have audio
      if (!audioId) {
        console.warn(
          `Stopping audio generation at chapter ${chapter.number} part ${partNumber} - no audio available`,
        );

        // Combine whatever audio we have so far and return it
        if (audioPaths.length > 0) {
          try {
            await combineMP3Files(audioPaths, audioPath);
            console.log(
              `Returning partial audio with ${audioPaths.length} segments`,
            );
            return createReadStream(audioPath);
          } catch (err) {
            console.error("Failed to combine partial MP3 files:", err);
            throw err;
          }
        } else {
          throw new Error(
            `No audio available for chapter ${chapter.number} part ${partNumber} and no previous audio to return`,
          );
        }
      }

      const partAudioPath = `books/book.${book.id}.audio/${audioId}.mp3`;
      audioPaths.push(partAudioPath);

      // Add short pause between parts (except after the last part)
      if (i < chapter.parts.length - 1) {
        const shortPauseId = await createSilence(0.5);
        const shortPausePath = `books/silence/${shortPauseId}.mp3`;
        audioPaths.push(shortPausePath);
      }
    }

    // Add longer pause between chapters (except after the last chapter)
    if (chapter !== book.chapters[book.chapters.length - 1]) {
      const chapterPauseId = await createSilence(3.0); // 3 second pause between chapters
      const chapterPausePath = `books/silence/${chapterPauseId}.mp3`;
      audioPaths.push(chapterPausePath);
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

async function generateChapterIntro(
  book: Book,
  chapter: Chapter,
): Promise<string> {
  const client = await getAudioClient(book);
  const introId = `chapter_${chapter.number}_intro`;

  // Check if intro already exists
  const introPath = `books/book.${book.id}.audio/${introId}.mp3`;
  try {
    await fs.access(introPath);
    console.log(`Chapter intro audio already exists: ${introPath}`);
    return introId;
  } catch {
    console.log(
      `Chapter intro audio does not exist, generating new audio: ${introPath}`,
    );
  }

  // Generate chapter introduction audio
  const introResponse = await client.chat.completions.create({
    model: "gpt-4o-audio-preview-2025-06-03",
    modalities: ["text", "audio"],
    max_completion_tokens: 15000,
    audio: {
      voice: "ash",
      format: "mp3",
    },
    messages: [
      {
        role: "system",
        content: `You are a professional audio book narrator. You speak clearly and dramatically. Include natural pauses where appropriate. ${book.instructions.audio}`,
      },
      {
        role: "user",
        content: book.details?.includeChapterTitles
          ? `Chapter ${chapter.number}: ${chapter.title}...`
          : `Chapter ${chapter.number}...`,
      },
      {
        role: "user",
        content: "Please speak the above text exactly as written",
      },
    ],
  });

  const introAudio = introResponse.choices[0].message.audio?.data;
  if (!introAudio) {
    throw new Error("No intro audio data returned in the response");
  }
  const introBuffer = Buffer.from(introAudio, "base64");
  await fs.mkdir(`books/book.${book.id}.audio`, { recursive: true });
  await fs.writeFile(introPath, introBuffer);
  console.log(`Chapter introduction audio saved as ${introId}.mp3`);

  return introId;
}

async function createSilence(duration: number): Promise<string> {
  const silenceId = `silence_${duration}s`;
  const silencePath = `books/silence/${silenceId}.mp3`;

  // Check if silence file already exists
  try {
    await fs.access(silencePath);
    console.log(`Silence audio file already exists: ${silencePath}`);
    return silenceId;
  } catch {
    console.log(
      `Silence audio file does not exist, generating new audio: ${silencePath}`,
    );
  }

  // Ensure directory exists
  await fs.mkdir("books/silence", { recursive: true });

  // Generate silence using ffmpeg
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input("anullsrc=r=44100:cl=stereo")
      .inputFormat("lavfi")
      .duration(duration)
      .audioCodec("libmp3lame")
      .audioBitrate(128)
      .output(silencePath)
      .on("end", () => {
        console.log(`Silence audio generated: ${silencePath} (${duration}s)`);
        resolve();
      })
      .on("error", (err) => {
        console.error("Error generating silence:", err);
        reject(err);
      })
      .run();
  });

  return silenceId;
}
