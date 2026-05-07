import { BooksRepository, FindAllFilters, FindAllResult } from '../repositories/booksRepository';
import { Book, BookInput, BookPatch } from '../models/book';
import { NotFoundError, ConflictError } from '../errors/AppError';

/**
 * Capa de servicios para la entidad Book.
 *
 * Responsabilidades:
 *  - Aplicar reglas de negocio (unicidad del ISBN, existencia del libro, etc.)
 *  - Orquestar las llamadas al repositorio
 *  - Lanzar errores de dominio (NotFoundError, ConflictError) cuando
 *    una regla no se cumple
 *
 * Lo que NO hace:
 *  - No conoce HTTP (no importa Request ni Response)
 *  - No construye DTOs con _links (eso es responsabilidad del Controller)
 *  - No ejecuta SQL (eso es responsabilidad del Repository)
 */
export class BooksService {
  constructor(private repo: BooksRepository) {}

  // ── Obtener uno ─────────────────────────────────────────────────────────

  async getById(isbn: string): Promise<Book> {
    const book = await this.repo.findById(isbn);
    if (!book) throw new NotFoundError(`No existe un libro con ISBN "${isbn}"`);
    return book;
  }

  // ── Listar con filtros y paginación ─────────────────────────────────────

  async list(filters: FindAllFilters, page: number, limit: number): Promise<FindAllResult> {
    return this.repo.findAll(filters, page, limit);
  }

  // ── Crear ───────────────────────────────────────────────────────────────

  /**
   * Regla de negocio: el ISBN es la clave primaria del dominio.
   * No puede existir dos libros con el mismo ISBN.
   */
  async create(input: BookInput): Promise<Book> {
    const existing = await this.repo.findById(input.isbn);
    if (existing) throw new ConflictError(`Ya existe un libro con ISBN "${input.isbn}"`);
    return this.repo.create(input);
  }

  // ── Reemplazar completo (PUT) ────────────────────────────────────────────

  /**
   * Regla de negocio: sólo se puede reemplazar un libro que existe.
   * El isbn de la URI es inmutable: no se puede reasignar.
   */
  async update(isbn: string, data: Omit<BookInput, 'isbn'>): Promise<Book> {
    const book = await this.repo.update(isbn, { isbn, ...data });
    if (!book) throw new NotFoundError(`No existe un libro con ISBN "${isbn}"`);
    return book;
  }

  // ── Actualización parcial (PATCH) ────────────────────────────────────────

  /**
   * Regla de negocio: sólo se puede modificar un libro que existe.
   * Tras la actualización recuperamos el libro completo para devolverlo.
   */
  async patch(isbn: string, fields: BookPatch): Promise<Book> {
    const updated = await this.repo.patch(isbn, fields);
    if (!updated) throw new NotFoundError(`No existe un libro con ISBN "${isbn}"`);
    // El repositorio no devuelve el libro actualizado; lo recuperamos explícitamente
    return (await this.repo.findById(isbn))!;
  }

  // ── Eliminar ────────────────────────────────────────────────────────────

  /**
   * Regla de negocio: sólo se puede eliminar un libro que existe.
   */
  async delete(isbn: string): Promise<void> {
    const deleted = await this.repo.delete(isbn);
    if (!deleted) throw new NotFoundError(`No existe un libro con ISBN "${isbn}"`);
  }
}
