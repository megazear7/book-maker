import express from 'express';
import { getBook } from '../services/get-book.js';
import page from './page.js';
import body from './body.js';
import { getBooks } from '../services/get-books.js';

const server = express();
const port = 3000;

server.get('/api/books', async (req, res) => {
    res.send(await getBooks());
});
server.get('/api/book/:id', async (req, res) => {
    res.send(await getBook(req.params.id));
});
server.use(express.static('dist/client'));
server.use(express.static("src/static"));
server.get('/*', async (req, res) => {
    res.send(page(body()));
});
server.listen(port, () => console.log(`Example app listening on port ${port}`));
