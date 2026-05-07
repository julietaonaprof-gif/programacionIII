import express from 'express';
import { Book } from './models/book';

const app = express();
app.use(express.json());

// ── "Base de datos" en memoria ───────────────────────────────────────────────
const books: Book[] = [
  { isbn: '978-0-06-112008-4', titulo: 'Matar un ruiseñor', autor: 'Harper Lee',          genero: 'Ficción',          paginas: 281 },
  { isbn: '978-0-45-228285-0', titulo: '1984',              autor: 'George Orwell',        genero: 'Distopía',         paginas: 328 },
  { isbn: '978-0-06-085052-4', titulo: 'Un mundo feliz',    autor: 'Aldous Huxley',        genero: 'Distopía',         paginas: 311 },
  { isbn: '978-84-450-7550-5', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', genero: 'Realismo mágico', paginas: 432 },
];

// ── GET /books ───────────────────────────────────────────────────────────────
// Lista todos los libros. Acepta ?titulo= para filtrar por título (búsqueda parcial).
app.get('/books', (req, res) => {
  const titulo = req.query.titulo as string | undefined;

  const result = titulo
    ? books.filter(b => b.titulo.toLowerCase().includes(titulo.toLowerCase()))
    : books;

  res.json(result);
});

// ── GET /books/:isbn ─────────────────────────────────────────────────────────
// Obtiene un único libro por su ISBN. Devuelve 404 si no existe.
app.get('/books/:isbn', (req, res) => {
  const isbn = req.params['isbn'] as string;
  const book = books.find(b => b.isbn === isbn);

  if (!book) {
    res.status(404).json({ error: `No existe un libro con ISBN "${isbn}"` });
    return;
  }

  res.json(book);
});

// ── Arranque ─────────────────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
