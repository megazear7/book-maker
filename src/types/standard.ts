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
    parts: z.object({
        min: z.number().min(1).default(3).describe("The minumum number of parts for the chapter"),
        max: z.number().min(1).default(5).describe("The maximum number of parts for the chapter"),
        length: z.number().min(1).default(600).describe("The the length of each part for the chapter"),
    }),
});
export type ChapterSummary = z.infer<typeof ChapterSummary>;

export const ChapterSummaryWithIndex = ChapterSummary.extend({
    index: z.number().min(1),
});
export type ChapterSummaryWithIndex = z.infer<typeof ChapterSummaryWithIndex>;

export const BookByChapters = z.object({
    chapters: ChapterSummary.array()
});
export type BookByChapters = z.infer<typeof BookByChapters>;

export const BookMakerConfig = z.object({
    title: z.string().describe("The name of the book being written"),
    book: z.string().describe("The name of the directory under the `data` directory that contains the book overview and chapter outline."),
    references: z.string().array().describe("The name of directories under the `data` directory that each contains a book.txt file and prompt.txt files. The book.txt file contains the contents of an already written book. The prompt.txt file contains describes this reference book's relationship to the book being written."),
});
export type BookMakerConfig = z.infer<typeof BookMakerConfig>;

export const Role = z.enum([ "system", "user", "assistant" ]);
export type Role = z.infer<typeof Role>;

export const ChapterOutlinePart = z.object({
    title: z.string().min(1).describe("The name of the chapter part"),
    events: z.string().min(1).array().describe("Details about the events that take place"),
});
export type ChapterOutlinePart = z.infer<typeof ChapterOutlinePart>;

export const ChapterOutline = z.object({
    parts: ChapterOutlinePart.array()
});
export type ChapterOutline = z.infer<typeof ChapterOutline>;
