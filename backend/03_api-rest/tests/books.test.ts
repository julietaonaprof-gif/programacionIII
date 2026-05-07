import request from 'supertest';
import sqlite3 from 'sqlite3';
import { Application } from 'express';
import { createApp } from '../src/app';
import { initDatabase } from '../src/database';

// ── Setup / Teardown ─────────────────────────────────────────────────────────

let app: Application;
let db: sqlite3.Database;

beforeAll(async () => {
  // Base de datos en memoria: cada corrida de tests parte desde cero
  db  = await initDatabase(':memory:');
  app = createApp(db);
});

afterAll((done) => {
  db.close(done);
});

beforeEach((done) => {
  // Limpiamos la tabla antes de cada test para garantizar aislamiento
  db.run('DELETE FROM books', done);
});

// ── Datos de prueba ──────────────────────────────────────────────────────────

const mockingbird = {
  isbn:    '978-0-06-112008-4',
  titulo:  'Matar un ruiseñor',
  autor:   'Harper Lee',
  genero:  'Ficción',
  paginas: 281,
};

const orwell = {
  isbn:    '978-0-45-228285-0',
  titulo:  '1984',
  autor:   'George Orwell',
  genero:  'Distopía',
  paginas: 328,
};

const huxley = {
  isbn:    '978-0-06-085052-4',
  titulo:  'Un mundo feliz',
  autor:   'Aldous Huxley',
  genero:  'Distopía',
  paginas: 311,
};

// ── POST /books ──────────────────────────────────────────────────────────────

describe('POST /books', () => {
  it('crea un libro y devuelve 201 con _links', async () => {
    const res = await request(app).post('/books').send(mockingbird);

    expect(res.status).toBe(201);
    expect(res.body.isbn).toBe(mockingbird.isbn);
    expect(res.body.titulo).toBe(mockingbird.titulo);

    // HATEOAS: verifica los cuatro verbos disponibles sobre el recurso
    expect(res.body._links.self.method).toBe('GET');
    expect(res.body._links.update.method).toBe('PUT');
    expect(res.body._links.patch.method).toBe('PATCH');
    expect(res.body._links.delete.method).toBe('DELETE');
  });

  it('devuelve 409 si el isbn ya existe', async () => {
    await request(app).post('/books').send(mockingbird);
    const res = await request(app).post('/books').send(mockingbird);

    expect(res.status).toBe(409);
  });

  it('devuelve 400 si faltan campos obligatorios', async () => {
    const res = await request(app).post('/books').send({ isbn: '123', titulo: 'Solo título' });

    expect(res.status).toBe(400);
  });

  it('devuelve 400 si paginas no es un entero positivo', async () => {
    const res = await request(app).post('/books').send({ ...mockingbird, paginas: -5 });

    expect(res.status).toBe(400);
  });
});

// ── GET /books/:isbn ─────────────────────────────────────────────────────────

describe('GET /books/:isbn', () => {
  it('devuelve el libro con todos los _links de HATEOAS', async () => {
    await request(app).post('/books').send(mockingbird);

    const res = await request(app).get(`/books/${mockingbird.isbn}`);

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe(mockingbird.titulo);

    // Nivel 3 Richardson: cada _link incluye href y method
    const links = res.body._links;
    expect(links.self).toMatchObject({ method: 'GET' });
    expect(links.update).toMatchObject({ method: 'PUT' });
    expect(links.patch).toMatchObject({ method: 'PATCH' });
    expect(links.delete).toMatchObject({ method: 'DELETE' });
    expect(links.list).toMatchObject({ method: 'GET' });
  });

  it('devuelve 404 para un isbn inexistente', async () => {
    const res = await request(app).get('/books/no-existe');

    expect(res.status).toBe(404);
  });
});

// ── GET /books (lista, filtros y paginación) ─────────────────────────────────

describe('GET /books', () => {
  beforeEach(async () => {
    await request(app).post('/books').send(mockingbird);
    await request(app).post('/books').send(orwell);
    await request(app).post('/books').send(huxley);
  });

  it('devuelve lista paginada con metadatos de paginación', async () => {
    const res = await request(app).get('/books?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });

  it('incluye _links de navegación: next existe, prev es null en la primera página', async () => {
    const res = await request(app).get('/books?page=1&limit=2');

    expect(res.body._links.next).not.toBeNull();
    expect(res.body._links.prev).toBeNull();
    expect(res.body._links.create).toMatchObject({ method: 'POST' });
  });

  it('en la última página next es null y prev existe', async () => {
    const res = await request(app).get('/books?page=2&limit=2');

    expect(res.body._links.next).toBeNull();
    expect(res.body._links.prev).not.toBeNull();
  });

  it('cada item de la lista tiene sus propios _links', async () => {
    const res = await request(app).get('/books');

    expect(res.status).toBe(200);
    for (const item of res.body.data) {
      expect(item._links).toBeDefined();
      expect(item._links.self).toBeDefined();
    }
  });

  it('filtra por titulo (búsqueda parcial, case insensitive)', async () => {
    const res = await request(app).get('/books?titulo=1984');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].titulo).toBe('1984');
  });

  it('filtra por isbn (búsqueda parcial)', async () => {
    const res = await request(app).get(`/books?isbn=${orwell.isbn}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].isbn).toBe(orwell.isbn);
  });
});

// ── PUT /books/:isbn ─────────────────────────────────────────────────────────

describe('PUT /books/:isbn', () => {
  it('reemplaza el libro completo y devuelve el recurso actualizado con _links', async () => {
    await request(app).post('/books').send(mockingbird);

    const res = await request(app)
      .put(`/books/${mockingbird.isbn}`)
      .send({ titulo: 'Nuevo título', autor: 'Nuevo autor', genero: 'Drama', paginas: 300 });

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Nuevo título');
    expect(res.body.autor).toBe('Nuevo autor');
    expect(res.body._links).toBeDefined();
  });

  it('devuelve 404 si el libro no existe', async () => {
    const res = await request(app)
      .put('/books/no-existe')
      .send({ titulo: 'T', autor: 'A', genero: 'G', paginas: 100 });

    expect(res.status).toBe(404);
  });

  it('devuelve 400 si faltan campos obligatorios', async () => {
    await request(app).post('/books').send(mockingbird);
    const res = await request(app).put(`/books/${mockingbird.isbn}`).send({ titulo: 'Solo' });

    expect(res.status).toBe(400);
  });
});

// ── PATCH /books/:isbn ────────────────────────────────────────────────────────

describe('PATCH /books/:isbn', () => {
  it('actualiza sólo el campo enviado (los demás permanecen igual)', async () => {
    await request(app).post('/books').send(mockingbird);

    const res = await request(app)
      .patch(`/books/${mockingbird.isbn}`)
      .send({ titulo: 'Título parcheado' });

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Título parcheado');
    // Los otros campos no cambiaron
    expect(res.body.autor).toBe(mockingbird.autor);
    expect(res.body.paginas).toBe(mockingbird.paginas);
    expect(res.body._links).toBeDefined();
  });

  it('puede actualizar múltiples campos en un solo PATCH', async () => {
    await request(app).post('/books').send(mockingbird);

    const res = await request(app)
      .patch(`/books/${mockingbird.isbn}`)
      .send({ genero: 'Clásico', paginas: 999 });

    expect(res.status).toBe(200);
    expect(res.body.genero).toBe('Clásico');
    expect(res.body.paginas).toBe(999);
  });

  it('devuelve 400 si no se envía ningún campo válido', async () => {
    await request(app).post('/books').send(mockingbird);

    // isbn es inmutable; enviarlo como único campo debe fallar
    const res = await request(app)
      .patch(`/books/${mockingbird.isbn}`)
      .send({ isbn: '000' });

    expect(res.status).toBe(400);
  });

  it('devuelve 404 si el libro no existe', async () => {
    const res = await request(app).patch('/books/no-existe').send({ titulo: 'X' });

    expect(res.status).toBe(404);
  });
});

// ── DELETE /books/:isbn ──────────────────────────────────────────────────────

describe('DELETE /books/:isbn', () => {
  it('elimina el libro y devuelve 204 sin body', async () => {
    await request(app).post('/books').send(mockingbird);

    const delRes = await request(app).delete(`/books/${mockingbird.isbn}`);
    expect(delRes.status).toBe(204);
    expect(delRes.body).toEqual({});

    // Confirma que ya no existe
    const getRes = await request(app).get(`/books/${mockingbird.isbn}`);
    expect(getRes.status).toBe(404);
  });

  it('devuelve 404 si el libro no existe', async () => {
    const res = await request(app).delete('/books/no-existe');

    expect(res.status).toBe(404);
  });
});
