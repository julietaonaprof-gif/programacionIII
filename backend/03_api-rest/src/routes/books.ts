import { Router } from 'express';
import { BooksController } from '../controllers/booksController';

/**
 * Fábrica de router: recibe el controlador como dependencia para que
 * sea posible inyectar un controlador con distinta BD en los tests.
 */
export function createBooksRouter(controller: BooksController): Router {
  const router = Router();

  // Colección
  router.get('/',    controller.list.bind(controller));   // listar / filtrar / paginar
  router.post('/',   controller.create.bind(controller)); // crear

  // Recurso individual
  router.get('/:isbn',    controller.getOne.bind(controller)); // obtener uno
  router.put('/:isbn',    controller.update.bind(controller)); // reemplazar completo
  router.patch('/:isbn',  controller.patch.bind(controller));  // actualizar parcialmente
  router.delete('/:isbn', controller.delete.bind(controller)); // eliminar

  return router;
}
