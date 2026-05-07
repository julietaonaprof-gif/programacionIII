import { Router } from 'express';
import { BooksController } from '../controllers/booksController';

export function createBooksRouter(controller: BooksController): Router {
  const router = Router();

  router.get('/',         controller.list.bind(controller));
  router.get('/:isbn',    controller.getOne.bind(controller));
  router.post('/',        controller.create.bind(controller));
  router.put('/:isbn',    controller.update.bind(controller));
  router.patch('/:isbn',  controller.patch.bind(controller));
  router.delete('/:isbn', controller.delete.bind(controller));

  return router;
}
