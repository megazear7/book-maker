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
import { PostBookRequest } from "../types/requests.js";

const server = express();
const port = 3000;
server.use(express.json());
server.get("/api/books", async (req, res) => {
  res.json(await getBooks());
});
server.get("/api/book/:id", async (req, res) => {
  res.json(await getBook(req.params.id));
});
server.post("/api/book", async (req, res) => {
  const body = PostBookRequest.parse(req.body);
  const client = new OpenAI({
      baseURL: env(`GROK_BASE_URL`),
      apiKey: env(`GROK_API_KEY`),
  });

  res.json(await makeBookOutline(client, 'grok', 'gpt', body.description));
});
server.post("/api/book/:id/chapter/:chapter/outline", async (req, res) => {
  res.json(
    await createChapterOutline(req.params.id, parseInt(req.params.chapter)),
  );
});
server.post("/api/book/:id/chapter/:chapter", async (req, res) => {
  res.json(await createChapter(req.params.id, parseInt(req.params.chapter)));
});
server.post("/api/book/:id/chapter/:chapter/part/:part", async (req, res) => {
  res.json(await createChapterPart(req.params.id, parseInt(req.params.chapter), parseInt(req.params.part)));
});
server.use(express.static("dist/client"));
server.use("/types", express.static("dist/types"));
server.use(express.static("src/static"));
server.get("/*", async (req, res) => {
  res.send(page(body()));
});
server.listen(port, () => console.log(`Example app listening on port ${port}`));
