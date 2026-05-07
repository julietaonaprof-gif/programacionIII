import express from 'express';
import { Book, BookPatch } from './models/book';

const app = express();
app.use(express.json());

// ── "Base de datos" en memoria ───────────────────────────────────────────────
const books: Book[] = [
  { isbn: '978-0-06-112008-4', titulo: 'Matar un ruiseñor',    autor: 'Harper Lee',             genero: 'Ficción',         paginas: 281 },
  { isbn: '978-0-45-228285-0', titulo: '1984',                 autor: 'George Orwell',           genero: 'Distopía',        paginas: 328 },
  { isbn: '978-0-06-085052-4', titulo: 'Un mundo feliz',       autor: 'Aldous Huxley',           genero: 'Distopía',        paginas: 311 },
  { isbn: '978-84-450-7550-5', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez',  genero: 'Realismo mágico', paginas: 432 },
];

const PATCHABLE_FIELDS: Array<keyof BookPatch> = ['titulo', 'autor', 'genero', 'paginas'];

// ── GET /books ───────────────────────────────────────────────────────────────
app.get('/books', (req, res) => {
  const titulo = req.query.titulo as string | undefined;
  const isbn   = req.query.isbn   as string | undefined;
  const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

  let result = books;
  if (titulo) {
    result = result.filter(b => b.titulo.toLowerCase().includes(titulo.toLowerCase()));
  }
  if (isbn) {
    result = result.filter(b => b.isbn.includes(isbn));
  }

  const total  = result.length;
  const offset = (page - 1) * limit;
  const data   = result.slice(offset, offset + limit);

  res.json({
    data,
    pagination: { 
      page, 
      limit, 
      total, 
      totalPages: Math.ceil(total / limit) 
    },
  });
});

// ── GET /books/:isbn ─────────────────────────────────────────────────────────
app.get('/books/:isbn', (req, res) => {
  const isbn = req.params['isbn'] as string;
  const book = books.find(b => b.isbn === isbn);

  if (!book) {
    res.status(404).json({ error: `No existe un libro con ISBN "${isbn}"` });
    return;
  }
  res.json(book);
});

// ── POST /books ──────────────────────────────────────────────────────────────
app.post('/books', (req, res) => {
  const { isbn, titulo, autor, genero, paginas } = req.body;

  if (!isbn || !titulo || !autor || !genero || paginas === undefined) {
    res.status(400).json({ error: 'Los campos isbn, titulo, autor, genero y paginas son obligatorios' });
    return;
  }
  if (typeof paginas !== 'number' || !Number.isInteger(paginas) || paginas <= 0) {
    res.status(400).json({ error: 'El campo paginas debe ser un entero positivo' });
    return;
  }

  const existing = books.find(b => b.isbn === isbn);
  if (existing) {
    res.status(409).json({ error: `Ya existe un libro con ISBN "${isbn}"` });
    return;
  }

  const newBook: Book = { isbn, titulo, autor, genero, paginas };
  books.push(newBook);
  res.status(201).json(newBook);
});

// ── PUT /books/:isbn ─────────────────────────────────────────────────────────
app.put('/books/:isbn', (req, res) => {
  const isbn = req.params['isbn'] as string;
  const { titulo, autor, genero, paginas } = req.body;

  if (!titulo || !autor || !genero || paginas === undefined) {
    res.status(400).json({ error: 'Los campos titulo, autor, genero y paginas son obligatorios' });
    return;
  }
  if (typeof paginas !== 'number' || !Number.isInteger(paginas) || paginas <= 0) {
    res.status(400).json({ error: 'El campo paginas debe ser un entero positivo' });
    return;
  }

  const idx = books.findIndex(b => b.isbn === isbn);
  if (idx === -1) {
    res.status(404).json({ error: `No existe un libro con ISBN "${isbn}"` });
    return;
  }

  books[idx] = { isbn, titulo, autor, genero, paginas };
  res.json(books[idx]);
});

// ── PATCH /books/:isbn ───────────────────────────────────────────────────────
app.patch('/books/:isbn', (req, res) => {
  const isbn = req.params['isbn'] as string;
  const idx  = books.findIndex(b => b.isbn === isbn);

  if (idx === -1) {
    res.status(404).json({ error: `No existe un libro con ISBN "${isbn}"` });
    return;
  }

  // Extraer sólo los campos permitidos
  const fields: BookPatch = {};
  for (const key of PATCHABLE_FIELDS) {
    if (req.body[key] !== undefined) {
      (fields as Record<string, unknown>)[key] = req.body[key];
    }
  }

  if (Object.keys(fields).length === 0) {
    res.status(400).json({ error: `Se debe enviar al menos uno de: ${PATCHABLE_FIELDS.join(', ')}` });
    return;
  }
  if (fields.paginas !== undefined) {
    if (typeof fields.paginas !== 'number' || !Number.isInteger(fields.paginas) || fields.paginas <= 0) {
      res.status(400).json({ error: 'El campo paginas debe ser un entero positivo' });
      return;
    }
  }

  books[idx] = { ...books[idx], ...fields };
  res.json(books[idx]);
});

// ── DELETE /books/:isbn ──────────────────────────────────────────────────────
app.delete('/books/:isbn', (req, res) => {
  const isbn = req.params['isbn'] as string;
  const idx  = books.findIndex(b => b.isbn === isbn);

  if (idx === -1) {
    res.status(404).json({ error: `No existe un libro con ISBN "${isbn}"` });
    return;
  }

  books.splice(idx, 1);
  res.status(204).send();
});

// ── Arranque ─────────────────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
