import express, { Application } from 'express';
import sqlite3 from 'sqlite3';
import { BooksRepository } from './repositories/booksRepository';
import { BooksService } from './services/booksService';
import { BooksController } from './controllers/booksController';
import { createBooksRouter } from './routes/books';
import { initDatabase } from './database';

/**
 * Fábrica de la aplicación Express.
 * Recibe la instancia de BD como parámetro para facilitar los tests
 * (tests usan ':memory:', producción usa el archivo en disco).
 */
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

// ── Punto de entrada (sólo se ejecuta con `node dist/app.js`) ────────────────

if (require.main === module) {
  const PORT = process.env.PORT ?? 3000;

  initDatabase()
    .then((db) => {
      const app = createApp(db);
      app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Error al inicializar la base de datos:', err);
      process.exit(1);
    });
}
