import OpenAI from "openai";
import { promises as fs } from "fs";
import { env } from "./env.js";

export async function makeAudio(outputFilePath: string, text: string) {
    const client = new OpenAI({
        apiKey: env("OPENAI_API_KEY"),
    });

    const response = await client.chat.completions.create({
        model: "gpt-4o-audio-preview-2025-06-03",
        modalities: ["text", "audio"],
        max_completion_tokens: 15000,
        audio: {
            voice: "ash", // Preview voice options here: https://www.openai.fm/
            format: "mp3", // Output format (mp3 or wav)
        },
        messages: [
            {
                role: "system",
                content: "You are a professional audio book narrator. You speak the provided text exactly as written."
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

    // const audio = await client.audio.speech.create({
    //     model: "tts-1-hd",
    //     voice: "ash",
    //     input: text,
    //     instructions: "Speak like you are an expert audio book narrator",
    // });
    // const buffer = Buffer.from(await audio.arrayBuffer());

    await fs.writeFile(outputFilePath, buffer);
}
