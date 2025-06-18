import z from "zod";
import { Cost, Usage } from "./prompt.type.js";

export const BookId = z.string().min(3).max(20).describe("The id of the book. This should be all lower case letters and should use dashes instead of spaces. It should be a snakecase version of the title, simplified if neccessary.");
export type BookId = z.infer<typeof BookId>;

export const BookTitle = z.string().min(1).describe("The title of the book");
export type BookTitle = z.infer<typeof BookTitle>;

export const BookReference = z.string().min(1).describe("Reference material to base writing style off of.");
export type BookReference = z.infer<typeof BookReference>;

export const BookOverview = z.string().min(1).describe("Overview of the book to write. This should contain the story, an overview of the plot, character summaries, plot devices, key moments, background information, and anything else to help set the stage for writing the book.");
export type BookOverview = z.infer<typeof BookOverview>;

export const BookChapterPartText = z.string().min(1).describe("A written part of a chapter of the book.");
export type BookChapterPartText = z.infer<typeof BookChapterPartText>;

export const BookChapterPartAudio = z.string().base64().describe("The audio for a part of a chapter of the book.");
export type BookChapterPartAudio = z.infer<typeof BookChapterPartAudio>;

export const ChapterPartTitle = z.string().min(1).describe("The name of the chapter part");
export type ChapterPartTitle = z.infer<typeof ChapterPartTitle>;

export const ChapterPartEvent = z.string().min(1).describe("Details about the events that take place");
export type ChapterPartEvent = z.infer<typeof ChapterPartEvent>;

export const ChapterPartOutline = z.object({
    title: ChapterPartTitle,
    events: ChapterPartEvent.array(),
});
export type ChapterPartOutline = z.infer<typeof ChapterPartOutline>;

export const ChapterPartCreated = z.object({
    text: BookChapterPartText,
    audio: BookChapterPartAudio,
});
export type ChapterPartCreated = z.infer<typeof ChapterPartCreated>;

export const ChapterPart = z.object({
    outline: ChapterPartOutline,
    created: ChapterPartCreated,
});
export type ChapterPart = z.infer<typeof ChapterPart>;

export const BookChapterText = z.string().min(1).describe("A written part of a chapter of the book.");
export type BookChapterText = z.infer<typeof BookChapterText>;

export const BookChapterAudio = z.string().base64().describe("The audio for a part of a chapter of the book.");
export type BookChapterAudio = z.infer<typeof BookChapterAudio>;

export const CreatedChapter = z.object({
    text: BookChapterText,
    audio: BookChapterAudio,
});
export type CreatedChapter = z.infer<typeof CreatedChapter>;

export const ChapterTitle = z.string().min(1).describe("The title of the chapter.");
export type ChapterTitle = z.infer<typeof ChapterTitle>;

export const ChapterWhen = z.string().min(1).describe("When the chapter takes place in the story.");
export type ChapterWhen = z.infer<typeof ChapterWhen>;

export const ChapterWhere = z.string().min(1).describe("Where the chapter takes place in the setting of the book.");
export type ChapterWhere = z.infer<typeof ChapterWhere>;

export const ChapterWhat = z.string().min(1).describe("What happens in the chapter. This shoud be as detailed as possible.");
export type ChapterWhat = z.infer<typeof ChapterWhat>;

export const ChapterWhy = z.string().min(1).describe("Why the chapter is included in the plot of the book.");
export type ChapterWhy = z.infer<typeof ChapterWhy>;

export const ChapterHow = z.string().min(1).describe("Specify what characters perspective is the chapter written from.");
export type ChapterHow = z.infer<typeof ChapterHow>;

export const ChapterWho = z.string().min(1).describe("Which characters are involved in the chapter.");
export type ChapterWho = z.infer<typeof ChapterWho>;

export const ChapterMinParts = z.number().min(1).max(4).describe("The minumum number of parts for the chapter");
export type ChapterMinParts = z.infer<typeof ChapterMinParts>;

export const ChapterMaxParts = z.number().min(2).max(6).describe("The maximum number of parts for the chapter");
export type ChapterMaxParts = z.infer<typeof ChapterMaxParts>;

export const ChapterPartLength = z.number().min(200).max(1200).describe("The the number of words of each part for the chapter. It should be short enough for the audio conversion to accurately transcribe the audio but long enough to be a significant portion of the chapter. A suggested number is 600.");
export type ChapterPartLength = z.infer<typeof ChapterPartLength>;

export const ChapterNumber = z.number().min(1).describe("The chapter number starting from 1");
export type ChapterNumber = z.infer<typeof ChapterNumber>;

export const Chapter = z.object({
    title: ChapterTitle,
    when: ChapterWhen,
    where: ChapterWhere,
    what: ChapterWhat,
    why: ChapterWhy,
    how: ChapterHow,
    who: ChapterWho,
    minParts: ChapterMinParts,
    maxParts: ChapterMaxParts,
    partLength: ChapterPartLength,
    parts: ChapterPart.array(),
    created: CreatedChapter.array(),
    number: ChapterNumber,
});
export type Chapter = z.infer<typeof Chapter>;

export const EditInstructions = z.string().min(1).describe("Instructions to follow when editing the book. These instructions should not include changes to the plot, storyline, or the order of events. The AI will edit each paragraph individually. These edits should be for things like tone, words to use or not use, and other changes that can be made one paragraph at a time.");
export type EditInstructions = z.infer<typeof EditInstructions>;

export const AudioInstructions = z.string().min(1).describe("Instructions to follow when creating the book audio. You can include here things like speed, tone, and speaking style.");
export type AudioInstructions = z.infer<typeof AudioInstructions>;

export const Instructions = z.object({
    edit: EditInstructions,
    audio: AudioInstructions,
});
export type Instructions = z.infer<typeof Instructions>;

export const PronunciationMatch = z.string().min(1).describe("Text to match on when looking for words to change in order to control the pronunciation in the audio.");
export type PronunciationMatch = z.infer<typeof PronunciationMatch>;

export const PronunciationReplace = z.string().min(1).describe("Text to replace the match with in order to control the pronunciation in the audio.");
export type PronunciationReplace = z.infer<typeof PronunciationReplace>;

export const Pronunciation = z.object({
    match: PronunciationMatch,
    replace: PronunciationReplace,
});
export type Pronunciation = z.infer<typeof Pronunciation>;

export const KnownModelTypeName = z.enum([ "grok", "gpt", "azure" ]);
export type KnownModelTypeName = z.infer<typeof KnownModelTypeName>;

export const ModelTypeName = KnownModelTypeName.or(z.string()).describe("The model you select should have three environment variables in a .env file called ABC_MODEL_NAME, ABC_API_KEY, and ABC_BASE_URL where `ABC` is replaced with the uppercse version of the model. The azure mmodel type requires a ABC_DEPLOYMENT environment variable as well.");
export type ModelTypeName = z.infer<typeof ModelTypeName>;

export const ModelTypeConfig = z.object({
    name: ModelTypeName,
    cost: Cost,
    usage: Usage,
});
export type ModelTypeConfig = z.infer<typeof ModelTypeConfig>;

export const BookModelConfigs = z.object({
    text: ModelTypeConfig,
    audio: ModelTypeConfig,
});
export type BookModelConfigs = z.infer<typeof BookModelConfigs>;

export const Book = z.object({
    id: BookId,
    title: BookTitle,
    references: BookReference.array(),
    overview: BookOverview,
    chapters: Chapter.array(),
    instructions: Instructions,
    pronunciation: Pronunciation.array(),
    model: BookModelConfigs,
});
export type Book = z.infer<typeof Book>;
