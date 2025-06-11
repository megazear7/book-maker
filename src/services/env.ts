import "dotenv/config";
import z from "zod";

export function env(name: string): string {
    return z.string().parse(process.env[name]);
}

export function envOptional(name: string): string | undefined {
    return z.string().optional().parse(process.env[name]);
}
