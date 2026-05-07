import { Request, Response } from 'express';
import { BooksService } from '../services/booksService';
import { BookPatch } from '../models/book';
import { bookLinks, collectionLinks } from '../hateoas/links';
import { NotFoundError, ConflictError } from '../errors/AppError';

// Campos que PATCH acepta (isbn es inmutable)
const PATCHABLE_FIELDS: Array<keyof BookPatch> = ['titulo', 'autor', 'genero', 'paginas'];

/**
 * Capa de controladores.
 *
 * Responsabilidades:
 *  - Extraer y validar los datos de entrada del request (params, query, body)
 *  - Llamar al servicio con los datos ya limpios
 *  - Construir el DTO de respuesta (datos del dominio + _links HATEOAS)
 *  - Traducir errores de dominio a códigos HTTP
 *
 * Lo que NO hace:
 *  - No ejecuta reglas de negocio (eso es del Service)
 *  - No ejecuta SQL (eso es del Repository)
 */
export class BooksController {
  constructor(private service: BooksService) {}

  // ── GET /books ───────────────────────────────────────────────────────────

  async list(req: Request, res: Response): Promise<void> {
    const titulo = req.query.titulo as string | undefined;
    const isbn   = req.query.isbn   as string | undefined;
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

    try {
      const { books, total } = await this.service.list({ titulo, isbn }, page, limit);

      const filters: Record<string, string> = {};
      if (titulo) filters.titulo = titulo;
      if (isbn)   filters.isbn   = isbn;

      res.json({
        data: books.map((book) => ({ ...book, _links: bookLinks(book.isbn, req) })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        _links: collectionLinks(req, page, limit, total, filters),
      });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ── GET /books/:isbn ─────────────────────────────────────────────────────

  async getOne(req: Request, res: Response): Promise<void> {
    const isbn = req.params['isbn'] as string;

    try {
      const book = await this.service.getById(isbn);
      res.json({ ...book, _links: bookLinks(isbn, req) });
    } catch (err) {
      this.handleError(err, res);
    }
  }

  // ── POST /books ──────────────────────────────────────────────────────────

  async create(req: Request, res: Response): Promise<void> {
    const { isbn, titulo, autor, genero, paginas } = req.body;

    // Validación de forma del input (responsabilidad HTTP del Controller)
    if (!isbn || !titulo || !autor || !genero || paginas === undefined) {
      res.status(400).json({ error: 'Los campos isbn, titulo, autor, genero y paginas son obligatorios' });
      return;
    }
    if (typeof paginas !== 'number' || !Number.isInteger(paginas) || paginas <= 0) {
      res.status(400).json({ error: 'El campo paginas debe ser un entero positivo' });
      return;
    }

    try {
      const book = await this.service.create({ isbn, titulo, autor, genero, paginas });
      res.status(201).json({ ...book, _links: bookLinks(isbn, req) });
    } catch (err) {
      this.handleError(err, res);
    }
  }

  // ── PUT /books/:isbn ─────────────────────────────────────────────────────

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
      const book = await this.service.update(isbn, { titulo, autor, genero, paginas });
      res.json({ ...book, _links: bookLinks(isbn, req) });
    } catch (err) {
      this.handleError(err, res);
    }
  }

  // ── PATCH /books/:isbn ───────────────────────────────────────────────────

  async patch(req: Request, res: Response): Promise<void> {
    const isbn = req.params['isbn'] as string;

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

    try {
      const book = await this.service.patch(isbn, fields);
      res.json({ ...book, _links: bookLinks(isbn, req) });
    } catch (err) {
      this.handleError(err, res);
    }
  }

  // ── DELETE /books/:isbn ──────────────────────────────────────────────────

  async delete(req: Request, res: Response): Promise<void> {
    const isbn = req.params['isbn'] as string;

    try {
      await this.service.delete(isbn);
      res.status(204).send();
    } catch (err) {
      this.handleError(err, res);
    }
  }

  // ── Manejo de errores de dominio ─────────────────────────────────────────

  /**
   * Traduce errores de dominio a respuestas HTTP.
   * El Service lanza errores semánticos; el Controller decide el status code.
   */
  private handleError(err: unknown, res: Response): void {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
    } else if (err instanceof ConflictError) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
