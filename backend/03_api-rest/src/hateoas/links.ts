import { Request } from 'express';

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────

export interface Link {
  href: string;
  method: string;
}

/** Links asociados a un único libro */
export interface BookLinks {
  self: Link;
  update: Link;  // PUT  – reemplazar el libro completo
  patch: Link;   // PATCH – modificar campos individuales
  delete: Link;
  list: Link;
}

/** Links asociados a la colección paginada */
export interface CollectionLinks {
  self: Link;
  next: Link | null;
  prev: Link | null;
  create: Link;  // POST – crear un nuevo libro
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Construye los hipervínculos para un recurso libro individual. */
export function bookLinks(isbn: string, req: Request): BookLinks {
  const base = `${req.protocol}://${req.get('host')}`;
  const href = `${base}/books/${isbn}`;

  return {
    self:   { href, method: 'GET' },
    update: { href, method: 'PUT' },
    patch:  { href, method: 'PATCH' },
    delete: { href, method: 'DELETE' },
    list:   { href: `${base}/books`, method: 'GET' },
  };
}

/**
 * Construye los hipervínculos de navegación para una colección paginada.
 *
 * @param filters  Parámetros de filtro activos (titulo, isbn, etc.)
 */
export function collectionLinks(
  req: Request,
  page: number,
  limit: number,
  total: number,
  filters: Record<string, string> = {},
): CollectionLinks {
  const base = `${req.protocol}://${req.get('host')}`;
  const totalPages = Math.ceil(total / limit);

  const buildHref = (p: number): string => {
    const params = new URLSearchParams({ ...filters, page: String(p), limit: String(limit) });
    return `${base}/books?${params.toString()}`;
  };

  return {
    self:   { href: buildHref(page), method: 'GET' },
    next:   page < totalPages ? { href: buildHref(page + 1), method: 'GET' } : null,
    prev:   page > 1          ? { href: buildHref(page - 1), method: 'GET' } : null,
    create: { href: `${base}/books`, method: 'POST' },
  };
}
