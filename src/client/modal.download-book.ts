import { Book } from "../types/book.type.js";
import { download } from "./service.download.js";
import { createModal } from "./service.modal.js";

export function openDownloadBookModal(book: Book): void {
  createModal(
    "Download Book",
    "Download",
    [
      {
        name: "format",
        label: "File Format",
        type: "dropdown",
        options: [
          { label: "Microsoft Word (.docx)", value: "docx" },
          { label: "Plain Text (.txt)", value: "txt" },
        ],
        default: "docx",
      },
      {
        name: "includeAudio",
        text: "Docx files are formatted for KDP publishing with a 6 inch x 9 inch trim size.",
        type: "paragraph",
        showIf: {
          fieldName: "format",
          value: "docx",
        },
      },
    ],
    async (result) => {
      const format = result.find((r) => r.name === "format")?.value || "txt";
      if (format === "txt") {
        const bookText = book.chapters
          .map((chapter) => {
            const text = chapter.parts.map((part) => part.text).join("\n");
            return `CHAPTER ${chapter.number}: ${chapter.title}\n\n${text || "Not written yet"}`;
          })
          .join("\n\n\n");
        download(bookText, `${book.id}.txt`);
      } else if (format === "docx") {
        // Use server endpoint for DOCX generation with mirrored margins
        const response = await fetch(`/api/book/${book.id}/download.docx`);
        if (!response.ok) {
          throw new Error("Failed to generate DOCX");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${book.id}.docx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    },
  );
}
