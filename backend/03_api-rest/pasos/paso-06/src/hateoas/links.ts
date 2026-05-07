import { Request } from 'express';

export interface Link { href: string; method: string; }

export interface BookLinks {
  self: Link;
  update: Link;
  patch: Link;
  delete: Link;
  list: Link;
}

export interface CollectionLinks {
  self: Link;
  next: Link | null;
  prev: Link | null;
  create: Link;
}

/** Links para un libro individual */
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

/** Links de navegación para la colección paginada */
export function collectionLinks(
  req: Request,
  page: number,
  limit: number,
  total: number,
  filters: Record<string, string> = {},
): CollectionLinks {
  const base       = `${req.protocol}://${req.get('host')}`;
  const totalPages = Math.ceil(total / limit);
  const buildHref  = (p: number) => {
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
