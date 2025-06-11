import { promises as fs } from "fs";
let i = 0;
export async function logMessages(messages) {
    fs.mkdir(`tmp`, { recursive: true });
    fs.writeFile(`tmp/messages-${i}.json`, JSON.stringify(messages, undefined, 4));
    i++;
}
//# sourceMappingURL=log-messages.js.map