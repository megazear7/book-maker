import { ChatCompletionMessageParam } from "openai/resources";
import { promises as fs } from "fs";

let i = 0;

export async function logMessages(messages: ChatCompletionMessageParam[]) {
    fs.mkdir(`tmp`, { recursive: true });
    fs.writeFile(`tmp/messages-${i}.json`, JSON.stringify(messages, undefined, 4));
    i++;
}
