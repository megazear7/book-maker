import z from "zod";
import { Prompt } from "../types/standard";

export const ChapterOutlinerParams = z.object({
    chapter: z
      .string()
      .min(1)
      .describe("The chapter title you want the ai to write"),
    min: z
      .number()
      .int()
      .min(1)
      .describe("The minimum number of parts for this chapter"),
      max: z
      .number()
      .int()
      .min(2)
      .describe("The maximum number of parts for this chapter"),
  });
export type ChapterOutlinerParams = z.infer<typeof ChapterOutlinerParams>;

export default ({ chapter, min, max }: ChapterOutlinerParams): Prompt => `
I want you to outline the "${chapter}" chapter into ${min} to ${max} distinct parts.
`;
