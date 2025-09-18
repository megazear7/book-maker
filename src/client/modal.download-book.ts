import { Book } from "../types/book.type.js";
import { download } from "./service.download.js";
import { createModal } from "./service.modal.js";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
} from "docx";

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
        const doc = new Document({
          sections: [
            // Title Page
            {
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: book.title,
                      size: 72,
                      font: "Garamond",
                    }), // 36pt = 72 half-points
                  ],
                  alignment: "center",
                  spacing: { before: 4000, after: 400 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "AUTHOR NAME",
                      size: 36,
                      font: "Garamond",
                    }), // 18pt = 36 half-points
                  ],
                  alignment: "center",
                  spacing: { after: 2000 },
                }),
              ],
            },
            // Copyright Page
            {
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Copyright © 2012 AUTHOR NAME",
                      size: 22,
                      font: "Garamond",
                    }), // 11pt = 22 half-points
                  ],
                  alignment: "center",
                  spacing: { before: 4000, after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "All rights reserved.",
                      size: 22,
                      font: "Garamond",
                    }),
                  ],
                  alignment: "center",
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "ISBN:", size: 22, font: "Garamond" }),
                  ],
                  alignment: "center",
                }),
              ],
            },
            // Dedication Page
            {
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "DEDICATION",
                      size: 28,
                      font: "Garamond",
                    }), // 14pt = 28 half-points
                  ],
                  alignment: "center",
                  spacing: { before: 3000, after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Insert dedication text here",
                      size: 22,
                      font: "Garamond",
                    }),
                  ],
                  alignment: "center",
                  spacing: { after: 2000 },
                }),
              ],
            },
            // Blank Page
            {
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [new Paragraph({ text: "" })],
            },
            // Contents Page
            {
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "CONTENTS",
                      size: 28,
                      font: "Garamond",
                    }),
                  ],
                  alignment: "center",
                  spacing: { before: 4000, after: 400 },
                }),
                new Table({
                  alignment: "center",
                  borders: {
                    top: { style: "none" },
                    bottom: { style: "none" },
                    left: { style: "none" },
                    right: { style: "none" },
                    insideHorizontal: { style: "none" },
                    insideVertical: { style: "none" },
                  },
                  rows: book.chapters.map(
                    (chapter, index) =>
                      new TableRow({
                        children: [
                          new TableCell({
                            margins: {
                              top: 100,
                              bottom: 100,
                              left: 100,
                              right: 100,
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: `Chapter ${chapter.number}`,
                                    size: 22,
                                    font: "Garamond",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          new TableCell({
                            margins: {
                              top: 100,
                              bottom: 100,
                              left: 100,
                              right: 100,
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: `Pg ${index + 1}`,
                                    size: 22,
                                    font: "Garamond",
                                  }),
                                ],
                                alignment: "right",
                              }),
                            ],
                          }),
                        ],
                      }),
                  ),
                }),
                new Paragraph({
                  text: "",
                  spacing: { after: 2000 },
                }),
              ],
            },
            // Blank Page
            {
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [new Paragraph({ text: "" })],
            },
            // Acknowledgments Page
            {
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "ACKNOWLEDGMENTS",
                      size: 28,
                      font: "Garamond",
                    }),
                  ],
                  alignment: "center",
                  spacing: { before: 4000, after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Insert acknowledgments text here",
                      size: 22,
                      font: "Garamond",
                    }),
                  ],
                  alignment: "center",
                  spacing: { after: 2000 },
                }),
              ],
            },
            // Blank Page
            {
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [new Paragraph({ text: "" })],
            },
            // Chapters
            ...book.chapters.map((chapter) => ({
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `CHAPTER ${chapter.number}`,
                      size: 28,
                      font: "Garamond",
                    }),
                  ],
                  alignment: "center",
                  spacing: { after: 400, before: 2000 },
                }),
                ...chapter.parts.flatMap((part) => {
                  const lines = (part.text || "").split("\n");
                  return lines.filter(line => !!line).map(
                    (line, index) =>
                      new Paragraph({
                        indent: { firstLine: 360 },
                        children: [
                          new TextRun({
                            text: line.trim(),
                            size: 24,
                            font: "Garamond",
                          }),
                        ],
                        spacing: {
                          line: 276,
                          after: 0,
                        },
                      }),
                  );
                }),
              ],
            })),
            // About the Author Page
            {
              properties: {
                page: {
                  size: { width: 8640, height: 12960 },
                  margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "ABOUT THE AUTHOR",
                      size: 28,
                      font: "Garamond",
                    }),
                  ],
                  alignment: "center",
                  spacing: { before: 4000, after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Insert author bio text here.",
                      size: 22,
                      font: "Garamond",
                    }),
                  ],
                  alignment: "center",
                  spacing: { after: 2000 },
                }),
              ],
            },
          ],
        });
        Packer.toBlob(doc).then((blob) => {
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
        });
      }
    },
  );
}
