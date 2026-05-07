import { Request, Response } from 'express';
import { BooksRepository } from '../repositories/booksRepository';
import { BookPatch } from '../models/book';

// ─────────────────────────────────────────────────────────────────────────────
// NOTA: En este paso el controlador tiene DOS responsabilidades mezcladas:
//   1. Lógica HTTP    (parsear request, construir response, código de estado)
//   2. Lógica de negocio (¿existe el ISBN? ¿el libro se puede editar?)
//
// El paso 5 extrae la lógica de negocio a una capa de servicios.
// ─────────────────────────────────────────────────────────────────────────────

const PATCHABLE_FIELDS: Array<keyof BookPatch> = ['titulo', 'autor', 'genero', 'paginas'];

export class BooksController {
  constructor(private repo: BooksRepository) {}

  async list(req: Request, res: Response): Promise<void> {
    const titulo = req.query.titulo as string | undefined;
    const isbn   = req.query.isbn   as string | undefined;
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

    try {
      const { books, total } = await this.repo.findAll({ titulo, isbn }, page, limit);
      res.json({
        data: books,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    const isbn = req.params['isbn'] as string;
    try {
      const book = await this.repo.findById(isbn);
      if (!book) { res.status(404).json({ error: `No existe un libro con ISBN "${isbn}"` }); return; }
      res.json(book);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const { isbn, titulo, autor, genero, paginas } = req.body;

    if (!isbn || !titulo || !autor || !genero || paginas === undefined) {
      res.status(400).json({ error: 'Los campos isbn, titulo, autor, genero y paginas son obligatorios' });
      return;
    }
    if (typeof paginas !== 'number' || !Number.isInteger(paginas) || paginas <= 0) {
      res.status(400).json({ error: 'El campo paginas debe ser un entero positivo' });
      return;
    }

    try {
      // Regla de negocio mezclada con HTTP ← esto se mueve al Service en el paso 5
      const existing = await this.repo.findById(isbn);
      if (existing) { res.status(409).json({ error: `Ya existe un libro con ISBN "${isbn}"` }); return; }

      const book = await this.repo.create({ isbn, titulo, autor, genero, paginas });
      res.status(201).json(book);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
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

    try {
      const book = await this.repo.update(isbn, { isbn, titulo, autor, genero, paginas });
      if (!book) { res.status(404).json({ error: `No existe un libro con ISBN "${isbn}"` }); return; }
      res.json(book);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    const isbn = req.params['isbn'] as string;

    const fields: BookPatch = {};
    for (const key of PATCHABLE_FIELDS) {
      if (req.body[key] !== undefined) (fields as Record<string, unknown>)[key] = req.body[key];
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

    try {
      const updated = await this.repo.patch(isbn, fields);
      if (!updated) { res.status(404).json({ error: `No existe un libro con ISBN "${isbn}"` }); return; }
      const book = await this.repo.findById(isbn);
      res.json(book);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const isbn = req.params['isbn'] as string;
    try {
      const deleted = await this.repo.delete(isbn);
      if (!deleted) { res.status(404).json({ error: `No existe un libro con ISBN "${isbn}"` }); return; }
      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
