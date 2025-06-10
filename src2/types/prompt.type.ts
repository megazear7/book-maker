import z from "zod";

export const Role = z.enum([ "system", "user", "assistant" ]);
export type Role = z.infer<typeof Role>;
