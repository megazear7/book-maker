import OpenAI from "openai";

export async function generateAudio(client: OpenAI, text: string): Promise<Buffer> {
    const response = await client.chat.completions.create({
        model: "gpt-4o-audio-preview",
        messages: [
            {
                role: "user",
                content: text
            }
        ],
        modalities: ["text", "audio"]
    });

    // The audio data is usually base64-encoded in the response
    // Here's how you might extract it:
    const audioData = response.choices[0].message.audio?.data;

    if (!audioData) {
        throw new Error("No audio data found!");
    }

    // Convert the base64 data to a Buffer and save it
    const audioBuffer = Buffer.from(audioData, "base64");
    return audioBuffer;
}
