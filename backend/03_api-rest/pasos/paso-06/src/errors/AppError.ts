/**
 * Errores de dominio.
 *
 * El Service los lanza cuando una regla de negocio no se cumple.
 * El Controller los captura y los traduce al código HTTP correspondiente.
 *
 * Ninguna de estas clases conoce HTTP: no importan Request, Response
 * ni códigos de estado. Eso las hace reutilizables más allá de HTTP.
 */

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
