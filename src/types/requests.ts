import z from "zod";
import { BookTitle, LoadingMessageContent } from "./book.type.js";

export const RequestPath = z.string();
export type RequestPath = z.infer<typeof RequestPath>;

export const RequestMethod = z.enum(["GET", "POST", "DELETE"]);
export type RequestMethod = z.infer<typeof RequestMethod>;

export const MinimumChapters = z.number();
export type MinimumChapters = z.infer<typeof MinimumChapters>;

export const MaximumChapters = z.number();
export type MaximumChapters = z.infer<typeof MaximumChapters>;

export const BookDescription = z.string();
export type BookDescription = z.infer<typeof BookDescription>;

export const PostBookRequest = z.object({
    description: BookDescription,
    min: MinimumChapters,
    max: MaximumChapters,
});
export type PostBookRequest = z.infer<typeof PostBookRequest>;

export const CreateEmptyBookRequest = z.object({
    title: BookTitle,
});
export type CreateEmptyBookRequest = z.infer<typeof CreateEmptyBookRequest>;

export const GetLoadingMessagesRequest = z.object({
    content: LoadingMessageContent,
});
export type GetLoadingMessagesRequest = z.infer<typeof GetLoadingMessagesRequest>;
