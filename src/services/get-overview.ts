import { BookMakerConfig } from "../types/standard";
import { promises as fs } from "fs";

export async function getOverview(config: BookMakerConfig) {
    return fs.readFile(`data/${config.book}/overview.md`, "utf-8");
}
