import { Book, BookId, ChapterPart, PropertyText } from "../types/book.type.js";
import { ChatCompletionMessageParam } from "openai/resources";
import { getTextClient } from "./client.js";
import { getJsonCompletion } from "./get-json-completion.js";
import { writeBook } from "./write-book.js";
import { getBook } from "./get-book.js";
import zodToJsonSchema from "zod-to-json-schema";
import { getProperty, setProperty } from "../shared/util.js";

export async function generateProperty(
  bookId: BookId,
  property: string,
  instructions: string,
  wordCount: number,
): Promise<ChapterPart> {
  const book: Book = await getBook(bookId);
  const value = getProperty(book, property.split("book.")[1]);

  console.log(`Generating property ${property} of book ${book.title}`);

  const history: ChatCompletionMessageParam[] = [
    ...propertyPrompt(book, property, value, instructions, wordCount),
  ];
  const client = await getTextClient(book);
  const chapterPartText = await getJsonCompletion(
    book,
    client,
    history,
    PropertyText,
  );
  const newProperty = {
    text: chapterPartText,
  };
  console.log(`Writing updates for property ${property} of book ${book.title}`);

  setProperty(book, property.split("book.")[1], newProperty.text);
  await writeBook(book);

  return newProperty;
}

const propertyPrompt = (
  book: Book,
  property: string,
  value: string,
  instructions: string,
  wordCount: number,
): ChatCompletionMessageParam[] => {
  const bookWithoutParts = {
    ...book,
    chapters: book.chapters.map((chapter) => ({
      ...chapter,
      parts: [],
    })),
  };
  return [
    {
      role: "user",
      content: `
Here are what the properties mean:
${zodToJsonSchema(Book)}



Here is the existing book content:
${bookWithoutParts}



Here is the current value of the property ${property}:
${value}



${instructions ? `Here are additional instructions from the user:\n${instructions}` : ""}



Generate the property ${property} for the book based on the existing content.
It should be roughly ${wordCount} words long.
Do not include the word count in the reply.
Do not welcome the user or provide any additional commentary.
`,
    },
  ];
};
