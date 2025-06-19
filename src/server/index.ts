import express from "express";
import { getBook } from "../services/get-book.js";
import page from "./page.js";
import body from "./body.js";
import { getBooks } from "../services/get-books.js";
import { createChapterOutline } from "../services/create-chapter-outline.js";
import { createChapter } from "../services/create-chapter.js";

const server = express();
const port = 3000;

server.get("/api/books", async (req, res) => {
  res.json(await getBooks());
});
server.get("/api/book/:id", async (req, res) => {
  res.json(await getBook(req.params.id));
});
server.post("/api/book/:id/chapter/:chapter/outline", async (req, res) => {
  res.json(
    await createChapterOutline(req.params.id, parseInt(req.params.chapter)),
  );
});
server.post("/api/book/:id/chapter/:chapter", async (req, res) => {
  res.json(await createChapter(req.params.id, parseInt(req.params.chapter)));
});
server.use(express.static("dist/client"));
server.use("/types", express.static("dist/types"));
server.use(express.static("src/static"));
server.get("/*", async (req, res) => {
  res.send(page(body()));
});
server.listen(port, () => console.log(`Example app listening on port ${port}`));
