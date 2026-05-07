import express, { Application } from 'express';
import sqlite3 from 'sqlite3';
import { BooksRepository } from './repositories/booksRepository';
import { BooksService } from './services/booksService';
import { BooksController } from './controllers/booksController';
import { createBooksRouter } from './routes/books';
import { initDatabase } from './database';

export function createApp(db: sqlite3.Database): Application {
  const app = express();
  app.use(express.json());

  // Wiring: Repository → Service → Controller → Router
  const repo       = new BooksRepository(db);
  const service    = new BooksService(repo);
  const controller = new BooksController(service);
  app.use('/books', createBooksRouter(controller));

  return app;
}

if (require.main === module) {
  initDatabase('./books.db').then((db) => {
    const app = createApp(db);
    app.listen(3000, () => {
      console.log('Servidor escuchando en http://localhost:3000');
    });
  }).catch((err) => {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  });
}
