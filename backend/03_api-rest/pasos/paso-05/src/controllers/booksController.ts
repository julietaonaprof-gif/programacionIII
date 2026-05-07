import { Request, Response } from 'express';
import { BooksService } from '../services/booksService';
import { BookPatch } from '../models/book';
import { NotFoundError, ConflictError } from '../errors/AppError';

const PATCHABLE_FIELDS: Array<keyof BookPatch> = ['titulo', 'autor', 'genero', 'paginas'];

/**
 * Controlador: responsabilidades exclusivamente HTTP.
 *
 * Comparado con el paso 4, ya no hay lógica de negocio aquí.
 * El controlador sólo:
 *   1. Extrae y valida la forma del input (req.params, req.body, req.query)
 *   2. Llama al servicio
 *   3. Construye la respuesta HTTP
 *   4. Traduce errores de dominio → códigos HTTP
 */
export class BooksController {
  constructor(private service: BooksService) {}

  async list(req: Request, res: Response): Promise<void> {
    const titulo = req.query.titulo as string | undefined;
    const isbn   = req.query.isbn   as string | undefined;
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

    try {
      const { books, total } = await this.service.list({ titulo, isbn }, page, limit);
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
      const book = await this.service.getById(isbn);
      res.json(book);
    } catch (err) {
      this.handleError(err, res);
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
      const book = await this.service.create({ isbn, titulo, autor, genero, paginas });
      res.status(201).json(book);
    } catch (err) {
      this.handleError(err, res);
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
      const book = await this.service.update(isbn, { titulo, autor, genero, paginas });
      res.json(book);
    } catch (err) {
      this.handleError(err, res);
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
      const book = await this.service.patch(isbn, fields);
      res.json(book);
    } catch (err) {
      this.handleError(err, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const isbn = req.params['isbn'] as string;
    try {
      await this.service.delete(isbn);
      res.status(204).send();
    } catch (err) {
      this.handleError(err, res);
    }
  }

  // Traduce errores de dominio a códigos HTTP — un único lugar para esta lógica
  private handleError(err: unknown, res: Response): void {
    if (err instanceof NotFoundError) res.status(404).json({ error: err.message });
    else if (err instanceof ConflictError) res.status(409).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
}
