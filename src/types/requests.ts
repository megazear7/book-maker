import z from "zod";

export const BookDescription = z.string();
export type BookDescription = z.infer<typeof BookDescription>;

export const PostBookRequest = z.object({
    description: BookDescription,
});
export type PostBookRequest = z.infer<typeof PostBookRequest>;
