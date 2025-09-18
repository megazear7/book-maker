import { LoadingMessages } from "../types/book.type.js";
import { Role } from "../types/prompt.type.js";
import { ChatCompletionMessageParam } from "openai/resources.js";
import { getJsonCompletionNoBook } from "./get-json-completion-no-book.js";

const prompt = (str: string): string =>
  `
${str}

You are a loading message generator for a book maker app.
Based on the above content, write 10 funny loading messages releveant to the
content. Each message should be 3-8 words long and should not include commas.
`.trim();

export async function getLoadingMessages(
  content: string,
): Promise<LoadingMessages> {
  const history: ChatCompletionMessageParam[] = [
    {
      role: Role.enum.user,
      content: prompt(content),
    },
  ];
  return getJsonCompletionNoBook(history, LoadingMessages);
}
