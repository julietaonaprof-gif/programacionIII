import { BooksRepository, FindAllFilters, FindAllResult } from '../repositories/booksRepository';
import { Book, BookInput, BookPatch } from '../models/book';
import { NotFoundError, ConflictError } from '../errors/AppError';

/**
 * Capa de servicios: lógica de negocio + orquestación del repositorio.
 *
 * Lo que SÍ hace:
 *  - Aplica reglas del dominio (unicidad de ISBN, existencia del libro)
 *  - Lanza errores semánticos (NotFoundError, ConflictError)
 *  - Coordina las llamadas al repositorio
 *
 * Lo que NO hace:
 *  - No conoce HTTP (no importa Request ni Response)
 *  - No ejecuta SQL (eso es del Repository)
 *  - No construye DTOs con _links (eso es del Controller)
 */
export class BooksService {
  constructor(private repo: BooksRepository) {}

  async getById(isbn: string): Promise<Book> {
    const book = await this.repo.findById(isbn);
    if (!book) throw new NotFoundError(`No existe un libro con ISBN "${isbn}"`);
    return book;
  }

  async list(filters: FindAllFilters, page: number, limit: number): Promise<FindAllResult> {
    return this.repo.findAll(filters, page, limit);
  }

  // Regla: el ISBN es único en el catálogo
  async create(input: BookInput): Promise<Book> {
    const existing = await this.repo.findById(input.isbn);
    if (existing) throw new ConflictError(`Ya existe un libro con ISBN "${input.isbn}"`);
    return this.repo.create(input);
  }

  // Regla: sólo se puede reemplazar un libro que existe
  async update(isbn: string, data: Omit<BookInput, 'isbn'>): Promise<Book> {
    const book = await this.repo.update(isbn, { isbn, ...data });
    if (!book) throw new NotFoundError(`No existe un libro con ISBN "${isbn}"`);
    return book;
  }

  // Regla: sólo se puede modificar un libro que existe
  async patch(isbn: string, fields: BookPatch): Promise<Book> {
    const updated = await this.repo.patch(isbn, fields);
    if (!updated) throw new NotFoundError(`No existe un libro con ISBN "${isbn}"`);
    return (await this.repo.findById(isbn))!;
  }

  // Regla: sólo se puede eliminar un libro que existe
  async delete(isbn: string): Promise<void> {
    const deleted = await this.repo.delete(isbn);
    if (!deleted) throw new NotFoundError(`No existe un libro con ISBN "${isbn}"`);
  }
}
