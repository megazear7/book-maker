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
} from "docx";
import { getBook } from "./get-book.js";

export async function createDocxFile(bookId: string): Promise<Buffer> {
  const book = await getBook(bookId);

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
              }),
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
              }),
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
              }),
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
      // Chapters with mirrored margins
      ...book.chapters.map((chapter) => ({
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
              new TextRun({
                text: `CHAPTER ${chapter.number}`,
                size: 28,
                font: "Garamond",
              }),
            ],
            alignment: "center",
            spacing: { after: 400, before: 2600 },
          }),
          ...chapter.parts.flatMap((part) => {
            const lines = (part.text || "").split("\n");
            const filteredLines = lines.filter((line) => !!line);
            return filteredLines.map(
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
  const modifiedXml = documentXml.replace(
    /<w:pgMar w:top="720" w:right="1152" w:bottom="720" w:left="864" w:header="708" w:footer="708" w:gutter="0"\/>/g,
    `<w:pgMar w:top="720" w:right="1152" w:bottom="720" w:left="864" w:header="708" w:footer="708" w:gutter="0"/><w:mirrorMargins w:val="true"/>`,
  );

  // Check if any modifications were made
  if (modifiedXml !== documentXml) {
    console.log("XML was modified - mirrorMargins added");
  } else {
    console.log("XML was NOT modified - no sections matched");
  }

  zip.updateFile("word/document.xml", Buffer.from(modifiedXml, "utf8"));
  return zip.toBuffer();
}
