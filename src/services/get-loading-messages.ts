import { LoadingMessages } from "../types/book.type.js";
import { Role } from "../types/prompt.type.js";
import { ChatCompletionMessageParam } from "openai/resources.js";
import { getJsonCompletionNoBook } from "./get-json-completion-no-book.js";
import { getBook } from "./get-book.js";
import { writeBook } from "./write-book.js";
import { BookId } from "../types/book.type.js";

const prompt = (str: string): string =>
  `
${str}

You are a loading message generator for a book maker app.
Based on the above content, write 10 funny loading messages releveant to the
content. Each message should be 3-8 words long and should not include commas.
`.trim();

export async function getLoadingMessages(
  bookId: BookId,
  content: string,
): Promise<LoadingMessages> {
  const book = await getBook(bookId);

  // Ensure loadingMessages is initialized
  if (!book.loadingMessages) {
    book.loadingMessages = [];
  }

  // Check if we have enough loading messages
  if (book.loadingMessages.length < 100) {
    // Generate 10 more messages
    console.log(
      `Generating 10 new loading messages (current count: ${book.loadingMessages.length})`,
    );
    const newMessages = await generateNewMessages(content);
    book.loadingMessages.push(...newMessages);
    await writeBook(book);
  } else {
    // Random chance: 1/10 to generate new messages and replace first 10
    if (Math.random() < 0.1) {
      console.log(
        `Randomly regenerating loading messages (current count: ${book.loadingMessages.length})`,
      );
      const newMessages = await generateNewMessages(content);
      book.loadingMessages.splice(0, 10, ...newMessages);
      await writeBook(book);
    } else {
      console.log(
        `Using existing loading messages (current count: ${book.loadingMessages.length})`,
      );
    }
  }

  return book.loadingMessages;
}

async function generateNewMessages(content: string): Promise<LoadingMessages> {
  const history: ChatCompletionMessageParam[] = [
    {
      role: Role.enum.user,
      content: prompt(content),
    },
  ];
  return getJsonCompletionNoBook(history, LoadingMessages);
}
