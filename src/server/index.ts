import express from 'express';
import { getBook } from '../services/get-book.js';
import page from './page.js';
import body from './body.js';
import { getBooks } from '../services/get-books.js';
import { createChapterParts } from '../services/create-chapter-parts.js';

const server = express();
const port = 3000;

server.get('/api/books', async (req, res) => {
    res.json(await getBooks());
});
server.get('/api/book/:id', async (req, res) => {
    res.json(await getBook(req.params.id));
});
server.post('/api/book/:id/chapter/:chapter/parts', async (req, res) => {
    res.json(await createChapterParts(req.params.id, parseInt(req.params.chapter)));
});
server.use(express.static('dist/client'));
server.use("/types", express.static('dist/types'));
server.use(express.static("src/static"));
server.get('/*', async (req, res) => {
    res.send(page(body()));
});
server.listen(port, () => console.log(`Example app listening on port ${port}`));
