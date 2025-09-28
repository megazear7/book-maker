import express from "express";
import { getBook } from "../services/get-book.js";
import page from "./page.js";
import body from "./body.js";
import { getBooks } from "../services/get-books.js";
import { createChapterOutline } from "../services/create-chapter-outline.js";
import { createChapter } from "../services/create-chapter.js";
import { createChapterPart } from "../services/create-chapter-part.js";
import { makeBookOutline } from "../services/make-book-outline.js";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { env } from "../services/env.js";
import {
  CreateEmptyBookRequest,
  GeneratePropertyRequest,
  GetLoadingMessagesRequest,
  PostBookRequest,
} from "../types/requests.js";
import { addEmptyChapter } from "../services/add-empty-chapter.js";
import { Book } from "../types/book.type.js";
import { writeBook } from "../services/write-book.js";
import { createEmpty } from "../services/util.js";
import { getLoadingMessages } from "../services/get-loading-messages.js";
import { deleteBook } from "../services/delete-book.js";
import { createChapterAudio } from "../services/create-chapter-audio.js";
import { getChapterPartAudioId } from "../services/get-chapter-part-audio-id.js";
import { promises as fs, createReadStream } from "fs";
import { mkdirSync } from "fs";
import { createChapterPartAudio } from "../services/create-chapter-part-audio.js";
import { getBookAudio } from "../services/get-book-audio.js";
import { editChapterPart, EditChapterPartOptions } from "../services/edit-chapter-part.js";
import multer from "multer";
import { generateProperty } from "../services/generate-property.js";
import { generateEverything } from "../services/book-generate-everything.js";
import { generatePreviewSentencePrompt } from "../services/prompts.js";
import { getTextClient } from "../services/client.js";
import { getTextModelConfig } from "../services/get-model-config.js";
import { getAudioClient } from "../services/client.js";
import { createDocxFile } from "../services/book-file-docx.js";

const server = express();
server.use(express.json({ limit: "10mb" }));
const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const book = req.params.book;
    const dir = `books/book.${book}.references`;
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, req.params.filename);
  },
});
const upload = multer({ storage });

async function getTextCompletion(
  book: Book,
  messages: ChatCompletionMessageParam[],
): Promise<string> {
  const client = await getTextClient(book);
  const modelConfig = getTextModelConfig(book);
  const completion = await client.chat.completions.create({
    model: modelConfig.modelName,
    messages,
    max_completion_tokens: 1000,
  });
  return completion.choices[0].message.content || "";
}

server.use(express.json());
server.get("/api/books", async (req, res) => {
  res.json(await getBooks());
});
server.get("/api/book/:book", async (req, res) => {
  res.json(await getBook(req.params.book));
});
server.delete("/api/book/:book", async (req, res) => {
  res.json(await deleteBook(req.params.book));
});
server.post("/api/book/:id/save", async (req, res) => {
  const book = Book.parse(req.body);
  await writeBook(book);
  res.json({ success: true });
});
server.post("/api/book/empty", async (req, res) => {
  const body = CreateEmptyBookRequest.parse(req.body);
  const book = createEmpty(Book);
  book.title = body.title;
  book.id = book.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  writeBook(book);
  res.json(book);
});
server.post("/api/book", async (req, res) => {
  const body = PostBookRequest.parse(req.body);
  const client = new OpenAI({
    baseURL: env(`GROK_BASE_URL`),
    apiKey: env(`GROK_API_KEY`),
  });

  res.json(
    await makeBookOutline(
      client,
      "grok",
      "gpt",
      body.description,
      body.min,
      body.max,
    ),
  );
});
server.post("/api/loading/messages", async (req, res) => {
  const body = GetLoadingMessagesRequest.parse(req.body);
  res.json(await getLoadingMessages(body.bookId, body.content));
});
server.post("/api/book/:book/chapter/add", async (req, res) => {
  res.json(await addEmptyChapter(req.params.book));
});
server.post("/api/book/:book/chapter/:chapter/outline", async (req, res) => {
  res.json(
    await createChapterOutline(req.params.book, parseInt(req.params.chapter)),
  );
});
server.post("/api/book/:book/chapter/:chapter", async (req, res) => {
  res.json(await createChapter(req.params.book, parseInt(req.params.chapter)));
});
server.post("/api/book/:book/property/:property", async (req, res) => {
  const body = GeneratePropertyRequest.parse(req.body);
  await generateProperty(
    req.params.book,
    req.params.property,
    body.instructions,
    body.wordCount,
  );
  res.json(await getBook(req.params.book));
});
server.post("/api/book/:book/chapter/:chapter/audio", async (req, res) => {
  res.json(
    await createChapterAudio(req.params.book, parseInt(req.params.chapter)),
  );
});
server.post("/api/book/:book/chapter/:chapter/part/:part", async (req, res) => {
  res.json(
    await createChapterPart(
      req.params.book,
      parseInt(req.params.chapter),
      parseInt(req.params.part),
    ),
  );
});
server.post("/api/book/:book/chapter/:chapter/part/:part/edit", async (req, res) => {
  const options: EditChapterPartOptions = req.body;
  res.json(
    await editChapterPart(
      req.params.book,
      parseInt(req.params.chapter),
      parseInt(req.params.part),
      options,
    ),
  );
});
server.post(
  "/api/book/:book/chapter/:chapter/part/:part/audio",
  async (req, res) => {
    res.json(
      await createChapterPartAudio(
        req.params.book,
        parseInt(req.params.chapter),
        parseInt(req.params.part),
      ),
    );
  },
);
server.get(
  "/api/book/:book/chapter/:chapter/part/:part/audio",
  async (req, res) => {
    const audioId = await getChapterPartAudioId(
      req.params.book,
      parseInt(req.params.chapter),
      parseInt(req.params.part),
    );
    
    if (!audioId) {
      res.status(404).send("Audio file not found");
      return;
    }
    
    const audioPath = `books/book.${req.params.book}.audio/${audioId}.mp3`;

    try {
      await fs.stat(audioPath);
      res.setHeader("Content-Type", "audio/mpeg");
      const stream = createReadStream(audioPath);
      stream.pipe(res);
    } catch {
      res.status(404).send("Audio file not found");
    }
  },
);
server.get("/api/book/:book/audio.mp3", async (req, res) => {
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${req.params.book}.mp3"`,
  );
  const stream = await getBookAudio(req.params.book);
  stream.pipe(res);
});
server.post(
  "/api/book/:book/chapter/:chapter/part/:part/audio",
  async (req, res) => {
    res.json(
      await createChapterPartAudio(
        req.params.book,
        parseInt(req.params.chapter),
        parseInt(req.params.part),
      ),
    );
  },
);
server.post(
  "/api/book/:book/reference/:filename",
  upload.single("file"),
  (req, res) => {
    res.json({ success: true });
  },
);
server.post("/api/book/:book/generate-everything", async (req, res) => {
  const { maxSpend } = req.body;
  res.json(await generateEverything(req.params.book, maxSpend));
});
server.post("/api/preview", async (req, res) => {
  const { word, bookId } = req.body;
  const book = await getBook(bookId);

  // Generate a preview sentence
  const messages = generatePreviewSentencePrompt(word, book);
  const sentence = await getTextCompletion(book, messages);

  // Apply pronunciation replacement
  const pronunciation = book.pronunciation.find((p) => p.match === word);
  let textToSpeak = sentence;
  if (pronunciation) {
    textToSpeak = sentence.replace(
      new RegExp(word, "gi"),
      pronunciation.replace,
    );
  }

  // Generate audio
  const client = await getAudioClient(book);
  const response = await client.chat.completions.create({
    model: "gpt-4o-audio-preview-2025-06-03",
    modalities: ["text", "audio"],
    max_completion_tokens: 15000,
    audio: {
      voice: "ash",
      format: "mp3",
    },
    messages: [
      {
        role: "system",
        content: `You are a professional audio book narrator. You repeat the provided text exactly as written. ${book.instructions.audio}`,
      },
      {
        role: "user",
        content: textToSpeak,
      },
    ],
  });

  const audio = response.choices[0].message.audio?.data;
  if (!audio) {
    throw new Error("No audio data returned in the response");
  }

  const buffer = Buffer.from(audio, "base64");
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(buffer);
});
server.get("/api/models", async (req, res) => {
  try {
    // Read .env file
    const envPath = ".env";
    const envContent = await fs.readFile(envPath, "utf-8");

    // Parse environment variables
    const envVars = envContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"))
      .map((line) => line.split("=")[0]?.trim())
      .filter((key) => key && key.endsWith("_MODEL_API_KEY"));

    // Extract model names (remove _MODEL_API_KEY suffix)
    const models = envVars.map((key) =>
      key.replace("_MODEL_API_KEY", "").toLowerCase(),
    );

    if (models.length === 0) {
      res.json({
        models: [],
        message:
          "No model API keys found in .env file. Please add environment variables ending with '_MODEL_API_KEY' (e.g., OPENAI_MODEL_API_KEY, GROK_MODEL_API_KEY).",
      });
    } else {
      res.json({
        models: models,
        message: null,
      });
    }
  } catch (error) {
    console.error("Error reading .env file:", error);
    res.status(500).json({
      models: [],
      message:
        "Error reading .env file. Please ensure the .env file exists and contains model API keys.",
    });
  }
});
server.get("/api/book/:book/download.docx", async (req, res) => {
  try {
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.params.book}.docx"`,
    );
    res.send(await createDocxFile(req.params.book));
  } catch (error) {
    console.error("Error generating DOCX:", error);
    res.status(500).send("Error generating DOCX file");
  }
});
server.use(express.static("dist/client"));
server.use("/shared", express.static("dist/shared"));
server.use("/types", express.static("dist/types"));
server.use(
  "/node_modules/docx/dist/index.mjs",
  express.static("node_modules/docx/dist/index.mjs"),
);
server.use(express.static("src/static"));
server.get("/*", async (req, res) => {
  res.send(page(body()));
});

// Error handling middleware
server.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

server.listen(port, () => console.log(`Example app listening on port ${port}`));

// Process-level error handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit the process, just log the error
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Don't exit the process, just log the error
});
