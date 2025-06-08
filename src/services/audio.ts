import OpenAI from "openai";
import { promises as fs } from "fs";
import { env } from "./env.js";
import { BookMakerConfig } from "../types/standard.js";

export async function makeAudio(config: BookMakerConfig, outputFilePath: string, text: string) {
    const audioInstructions = await fs.readFile(`data/${config.book}/audio-instructions.txt`);

    const client = new OpenAI({
        apiKey: env("OPENAI_API_KEY"),
    });

    const response = await client.chat.completions.create({
        model: "gpt-4o-audio-preview-2025-06-03",
        modalities: ["text", "audio"],
        max_completion_tokens: 15000,
        audio: {
            voice: "ash", // Preview voice options here: https://www.openai.fm/
            format: config.audio.format, // Output format (mp3 or wav)
        },
        messages: [
            {
                role: "system",
                content: `You are a professional audio book narrator. You repeat the provided text exactly as written. ${audioInstructions}`
            },
            {
                role: "user",
                content: text
            },
            {
                role: "user",
                content: "Please speak the above text exactly as written"
            }
        ]
    });
    const audio = response.choices[0].message.audio?.data;
    if (!audio) {
      throw new Error("No audio data returned in the response");
    }
    const buffer = Buffer.from(audio, "base64");

    await fs.writeFile(outputFilePath, buffer);
}
