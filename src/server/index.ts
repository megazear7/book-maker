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
import { env } from "../services/env.js";
import { CreateEmptyBookRequest, GetLoadingMessagesRequest, PostBookRequest } from "../types/requests.js";
import { addEmptyChapter } from "../services/add-empty-chapter.js";
import { Book } from "../types/book.type.js";
import { writeBook } from "../services/write-book.js";
import { createEmpty } from "../services/util.js";
import { getLoadingMessages } from "../services/get-loading-messages.js";
import { deleteBook } from "../services/delete-book.js";
import { createChapterAudio } from "../services/create-chapter-audio.js";
import { getChapterPartAudioId } from "../services/get-chapter-part-audio-id.js";
import { promises as fs, createReadStream } from "fs";
import { createChapterPartAudio } from "../services/create-chapter-part-audio.js";
import { getBookAudio } from "../services/get-book-audio.js";

const server = express();
const port = 3000;
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
  await writeBook(book)
  res.json({ success: true });
});
server.post("/api/book/empty", async (req, res) => {
  const body = CreateEmptyBookRequest.parse(req.body);
  const book = createEmpty(Book);
  book.title = body.title;
  book.id = book.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  writeBook(book);
  res.json(book);
});
server.post("/api/book", async (req, res) => {
  const body = PostBookRequest.parse(req.body);
  const client = new OpenAI({
      baseURL: env(`GROK_BASE_URL`),
      apiKey: env(`GROK_API_KEY`),
  });

  res.json(await makeBookOutline(client, 'grok', 'gpt', body.description, body.min, body.max));
});
server.post("/api/loading/messages", async (req, res) => {
  const body = GetLoadingMessagesRequest.parse(req.body);
  res.json(await getLoadingMessages(body.content));
});
server.post("/api/book/:book/chapter/add", async (req, res) => {
  res.json(
    await addEmptyChapter(req.params.book),
  );
});
server.post("/api/book/:book/chapter/:chapter/outline", async (req, res) => {
  res.json(
    await createChapterOutline(req.params.book, parseInt(req.params.chapter)),
  );
});
server.post("/api/book/:book/chapter/:chapter", async (req, res) => {
  res.json(await createChapter(req.params.book, parseInt(req.params.chapter)));
});
server.post("/api/book/:book/chapter/:chapter/audio", async (req, res) => {
  res.json(await createChapterAudio(req.params.book, parseInt(req.params.chapter)));
});
server.post("/api/book/:book/chapter/:chapter/part/:part", async (req, res) => {
  res.json(await createChapterPart(req.params.book, parseInt(req.params.chapter), parseInt(req.params.part)));
});
server.get("/api/book/:book/chapter/:chapter/part/:part/audio", async (req, res) => {
  const audioId = await getChapterPartAudioId(req.params.book, parseInt(req.params.chapter), parseInt(req.params.part));
  const audioPath = `books/book.${req.params.book}.audio/${audioId}.mp3`;

  try {
    await fs.stat(audioPath);
    res.setHeader('Content-Type', 'audio/mpeg');
    const stream = createReadStream(audioPath);
    stream.pipe(res);
  } catch (error) {
    res.status(404).send('Audio file not found');
  }
});
server.get("/api/book/:book/audio.mp3", async (req, res) => {
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.book}.mp3"`);
  const stream = await getBookAudio(req.params.book);
  stream.pipe(res);
});
server.post("/api/book/:book/chapter/:chapter/part/:part/audio", async (req, res) => {
  res.json(await createChapterPartAudio(req.params.book, parseInt(req.params.chapter), parseInt(req.params.part)));
});
server.use(express.static("dist/client"));
server.use("/types", express.static("dist/types"));
server.use(express.static("src/static"));
server.get("/*", async (req, res) => {
  res.send(page(body()));
});
server.listen(port, () => console.log(`Example app listening on port ${port}`));
