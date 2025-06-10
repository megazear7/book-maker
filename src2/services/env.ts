import "dotenv/config";
import z from "zod";

export function env(name: string): string {
    return z.string().parse(process.env[name]);
}
