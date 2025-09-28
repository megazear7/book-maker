import { promises as fs } from "fs";
import AdmZip from "adm-zip";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Footer,
  PageNumber,
  Bookmark,
} from "docx";
import { getBook } from "./get-book.js";

export async function createDocxFile(bookId: string): Promise<Buffer> {
  const book = await getBook(bookId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: any[] = [];

  // Title Page
  sections.push({
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
          }),
        ],
        alignment: "center",
        spacing: { before: 4000, after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: book.details?.authorName || "AUTHOR NAME",
            size: 36,
            font: "Garamond",
          }),
        ],
        alignment: "center",
        spacing: { after: 2000 },
      }),
    ],
  });

  // Copyright Page
  if (book.details?.isbn) {
    sections.push({
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
              text: `Copyright © ${new Date().getFullYear()} ${book.details?.authorName || "AUTHOR NAME"}`,
              size: 22,
              font: "Garamond",
            }),
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
            new TextRun({
              text: `ISBN: ${book.details.isbn}`,
              size: 22,
              font: "Garamond",
            }),
          ],
          alignment: "center",
        }),
      ],
    });
  }

  // Dedication Page
  if (book.details?.dedication) {
    sections.push({
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
            }),
          ],
          alignment: "center",
          spacing: { before: 3000, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: book.details.dedication,
              size: 22,
              font: "Garamond",
            }),
          ],
          alignment: "center",
          spacing: { after: 2000 },
        }),
      ],
    });
  }

  // Blank Page
  sections.push({
    properties: {
      page: {
        size: { width: 8640, height: 12960 },
        margin: { top: 720, bottom: 720, left: 720, right: 720 },
      },
    },
    children: [new Paragraph({ text: "" })],
  });

  // Contents Page
  sections.push({
    properties: {
      page: {
        size: { width: 8640, height: 12960 },
        margin: { top: 720, bottom: 720, left: 720, right: 1440 },
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
          (chapter) =>
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
                          text: book.details?.includeChapterTitles
                            ? `Chapter ${chapter.number}: ${chapter.title}`
                            : `Chapter ${chapter.number}`,
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
                          text: `chapter_${chapter.number}_table_of_contents`,
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
  });

  // Blank Page
  sections.push({
    properties: {
      page: {
        size: { width: 8640, height: 12960 },
        margin: { top: 720, bottom: 720, left: 720, right: 720 },
      },
    },
    children: [new Paragraph({ text: "" })],
  });

  // Acknowledgments Page
  if (book.details?.acknowledgements) {
    sections.push({
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
              text: book.details.acknowledgements,
              size: 22,
              font: "Garamond",
            }),
          ],
          alignment: "center",
          spacing: { after: 2000 },
        }),
      ],
    });
  }

  // Blank Page
  sections.push({
    properties: {
      page: {
        size: { width: 8640, height: 12960 },
        margin: { top: 720, bottom: 720, left: 720, right: 720 },
      },
    },
    children: [new Paragraph({ text: "" })],
  });

  // Chapters with mirrored margins
  book.chapters.forEach((chapter) => {
    sections.push({
      properties: {
        page: {
          size: { width: 8640, height: 12960 },
          margin: {
            top: 720,
            bottom: 720,
            left: 864, // Outside margin (narrow)
            right: 1152, // Inside margin (wide, for binding)
          },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                }),
              ],
              alignment: "center",
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          children: [
            new Bookmark({
              id: `chapter_${chapter.number}`,
              children: [
                new TextRun({
                  text: book.details?.includeChapterTitles
                    ? `CHAPTER ${chapter.number}: ${chapter.title}`
                    : `CHAPTER ${chapter.number}`,
                  size: 28,
                  font: "Garamond",
                }),
              ],
            }),
          ],
          alignment: "center",
          spacing: { after: 400, before: 2600 },
        }),
        ...chapter.parts.flatMap((part) => {
          const lines = (part.text || "")
            .split(/\n|\\n/)
            .filter((line: string) => !!line.trim());
          return lines.map(
            (line) =>
              new Paragraph({
                indent: { firstLine: 200 },
                children: [
                  new TextRun({
                    text: line,
                    size: 24,
                    font: "Garamond",
                  }),
                ],
                spacing: {
                  line: 360,
                  after: 0,
                },
              }),
          );
        }),
      ],
    });
  });

  // About the Author Page
  if (book.details?.aboutTheAuthor) {
    sections.push({
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
              text: book.details.aboutTheAuthor,
              size: 22,
              font: "Garamond",
            }),
          ],
          alignment: "center",
          spacing: { after: 2000 },
        }),
      ],
    });
  }

  const doc = new Document({
    sections,
  });

  const buffer = await Packer.toBuffer(doc);

  // Apply mirrored margins to chapter sections
  const zip = new AdmZip(buffer);
  const documentXml = zip.readAsText("word/document.xml");
  const settingsXml = zip.readAsText("word/settings.xml");

  // Enable different odd and even pages in settings
  const modifiedSettingsXml = settingsXml.replace(
    /(<w:settings[^>]*>)/,
    "$1<w:evenAndOddHeaders/>",
  );

  zip.updateFile("word/settings.xml", Buffer.from(modifiedSettingsXml, "utf8"));

  await fs.writeFile("debug-document.xml", documentXml, "utf8");

  // Modify XML to add mirrorMargins to chapter sections
  // Chapter sections are identified by having footers (page numbers)
  let modifiedXml = documentXml.replace(
    /<w:pgMar w:top="720" w:right="1152" w:bottom="720" w:left="864" w:header="708" w:footer="708" w:gutter="0"\/>/g,
    `<w:pgMar w:top="720" w:right="1152" w:bottom="720" w:left="864" w:header="708" w:footer="708" w:gutter="0"/><w:mirrorMargins w:val="true"/>`,
  );

  book.chapters.forEach((chapter) => {
    modifiedXml = modifiedXml.replaceAll(
      `chapter_${chapter.number}_table_of_contents`,
      `<w:fldSimple w:instr="PAGEREF chapter_${chapter.number} \\h"><w:r><w:t>Page #</w:t></w:r></w:fldSimple>`,
    );
  });

  zip.updateFile("word/document.xml", Buffer.from(modifiedXml, "utf8"));
  return zip.toBuffer();
}
