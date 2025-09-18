import { z } from "zod";

export const PageName = z
  .enum(["home", "book", "chapter", "part"])
  .describe(
    "The name of the current page, used for routing and rendering the correct content.",
  );
export type PageName = z.infer<typeof PageName>;
