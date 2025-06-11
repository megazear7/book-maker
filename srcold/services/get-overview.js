import { promises as fs } from "fs";
export async function getOverview(config) {
    return fs.readFile(`data/${config.book}/overview.md`, "utf-8");
}
//# sourceMappingURL=get-overview.js.map