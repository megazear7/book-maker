import ffmpeg from "fluent-ffmpeg";
import path from "path";

export async function concatAudio(inputFiles: string[], outputFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const command = ffmpeg();

        // Add each input file
        inputFiles.forEach((file) => {
            command.input(file);
        });

        command
            .on("end", () => {
                console.log(`Concatenated audio saved to ${outputFile}`);
                resolve();
            })
            .on("error", (err) => {
                console.error("Error concatenating audio:", err);
                reject(err);
            })
            .mergeToFile(outputFile, path.dirname(outputFile));
    });
}
