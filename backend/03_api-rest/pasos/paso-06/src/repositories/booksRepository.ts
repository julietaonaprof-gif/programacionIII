import sqlite3 from 'sqlite3';
import { Book, BookInput, BookPatch } from '../models/book';

export interface FindAllFilters { titulo?: string; isbn?: string; }
export interface FindAllResult  { books: Book[]; total: number; }

export class BooksRepository {
  constructor(private db: sqlite3.Database) {}

  findById(isbn: string): Promise<Book | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM books WHERE isbn = ?', [isbn], (err, row) => {
        if (err) return reject(err);
        resolve((row as Book) ?? null);
      });
    });
  }

  findAll(filters: FindAllFilters, page: number, limit: number): Promise<FindAllResult> {
    return new Promise((resolve, reject) => {
      const conditions: string[] = [];
      const params: (string | number)[] = [];

      if (filters.titulo) { conditions.push('titulo LIKE ?'); params.push(`%${filters.titulo}%`); }
      if (filters.isbn)   { conditions.push('isbn LIKE ?');   params.push(`%${filters.isbn}%`); }

      const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const offset = (page - 1) * limit;

      this.db.get(`SELECT COUNT(*) AS total FROM books ${where}`, params, (err, countRow) => {
        if (err) return reject(err);
        const total = (countRow as { total: number })?.total ?? 0;

        this.db.all(`SELECT * FROM books ${where} LIMIT ? OFFSET ?`, [...params, limit, offset], (err2, rows) => {
          if (err2) return reject(err2);
          resolve({ books: (rows as Book[]) ?? [], total });
        });
      });
    });
  }

  create(book: BookInput): Promise<Book> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO books (isbn, titulo, autor, genero, paginas) VALUES (?, ?, ?, ?, ?)',
        [book.isbn, book.titulo, book.autor, book.genero, book.paginas],
        (err) => { if (err) return reject(err); resolve(book); },
      );
    });
  }

  update(isbn: string, book: BookInput): Promise<Book | null> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE books SET titulo = ?, autor = ?, genero = ?, paginas = ? WHERE isbn = ?',
        [book.titulo, book.autor, book.genero, book.paginas, isbn],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0 ? book : null);
        },
      );
    });
  }

  patch(isbn: string, fields: BookPatch): Promise<boolean> {
    const keys = Object.keys(fields) as Array<keyof BookPatch>;
    return new Promise((resolve, reject) => {
      const setClauses = keys.map((k) => `${k} = ?`).join(', ');
      const values     = keys.map((k) => fields[k]);
      this.db.run(`UPDATE books SET ${setClauses} WHERE isbn = ?`, [...values, isbn], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  delete(isbn: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM books WHERE isbn = ?', [isbn], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }
}
