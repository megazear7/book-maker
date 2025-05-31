import z from "zod";

export const Prompt = z.string().min(1);
export type Prompt = z.infer<typeof Prompt>;

export const ChapterPart = z.object({
    title: z.string().min(1).describe("The title of this part of the chapter"),
    description: z.string().min(1).describe("The detailed description of this part of the chapter"),
});
export type ChapterPart = z.infer<typeof ChapterPart>;

export const ChapterByParts = z.object({
    parts: ChapterPart.array()
});
export type ChapterByParts = z.infer<typeof ChapterByParts>;

export const ChapterSummary = z.object({
    title: z.string().min(1).describe("The title of the chapter."),
    when: z.string().min(1).describe("When the chapter takes place in the story."),
    where: z.string().min(1).describe("Where the chapter takes place in the setting of the book."),
    what: z.string().min(1).describe("What happens in the chapter. This shoud be as detailed as possible."),
    why: z.string().min(1).describe("Why the chapter is included in the plot of the book."),
    how: z.string().min(1).describe("Specify what characters perspective is the chapter written from."),
    who: z.string().min(1).describe("Which characters is involved in the chapter."),
});
export type ChapterSummary = z.infer<typeof ChapterSummary>;

export const BookByChapters = z.object({
    chapters: ChapterSummary.array()
});
export type BookByChapters = z.infer<typeof BookByChapters>;
