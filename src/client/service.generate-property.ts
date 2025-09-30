import { Book } from "../types/book.type.js";
import { createModal } from "./service.modal.js";
import { generatePropertyApi } from "./service.api.js";
import { getProperty } from "../shared/util.js";

export function generateProperty(book: Book, property: string): void {
  const value = getProperty(book, property.split("book.")[1]);
  const length = value.split(" ").length;
  createModal(
    `Generate ${property}`,
    "Generate",
    [
      {
        name: "instructions",
        label: "Instructions",
        type: "textarea",
        placeholder: "Expand to include more details...",
      },
      {
        name: "wordCount",
        label: "Word Count",
        type: "number",
        default: length.toString() || "100",
      },
    ],
    async (result) => {
      const instructions = result.find((r) => r.name === "instructions")
        ?.value as string;
      const wordCount = parseInt(
        result.find((r) => r.name === "wordCount")?.value as string,
      );
      await generatePropertyApi(book.id, property, instructions, wordCount);
      // Reload the page to reflect changes
      window.location.reload();
    },
  );
}
