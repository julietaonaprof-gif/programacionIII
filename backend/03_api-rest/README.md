# Ejemplo 3 — API REST con Express y SQLite

Ejemplo práctico de una **API REST** para gestionar un catálogo de libros.  
El objetivo es ilustrar los principios del estilo arquitectónico REST y el **Modelo de Madurez de Richardson** llegando al nivel 3 (HATEOAS).

---

## Índice

1. [¿Qué es una API REST?](#1-qué-es-una-api-rest)
2. [Modelo de Madurez de Richardson](#2-modelo-de-madurez-de-richardson)
3. [Entidad: Libro](#3-entidad-libro)
4. [Endpoints disponibles](#4-endpoints-disponibles)
5. [HATEOAS en la práctica](#5-hateoas-en-la-práctica)
6. [Arquitectura en capas](#6-arquitectura-en-capas)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Descripción de cada capa](#8-descripción-de-cada-capa)
9. [Cómo ejecutar el proyecto](#9-cómo-ejecutar-el-proyecto)
10. [Cómo ejecutar los tests](#10-cómo-ejecutar-los-tests)
11. [Ejemplos de uso con curl](#11-ejemplos-de-uso-con-curl)

---

## 1. ¿Qué es una API REST?

**REST** (Representational State Transfer) es un estilo arquitectónico para sistemas distribuidos propuesto por Roy Fielding en su tesis doctoral (2000). No es un protocolo ni un estándar, sino un conjunto de **restricciones de diseño** que, cuando se respetan, producen sistemas escalables, desacoplados y predecibles.

Las restricciones principales son:

| Restricción | Descripción |
|---|---|
| **Cliente–Servidor** | La UI y el almacenamiento de datos están separados. El cliente no sabe cómo se persiste la información. |
| **Sin estado (Stateless)** | Cada request contiene toda la información necesaria para ser procesado. El servidor no guarda contexto entre requests. |
| **Cacheable** | Las respuestas deben indicar si pueden o no ser cacheadas. |
| **Interfaz uniforme** | Todos los recursos se identifican por URIs y se manipulan con un conjunto acotado de operaciones (HTTP verbs). |
| **Sistema en capas** | El cliente no sabe si habla directamente con el servidor final o con un intermediario (proxy, load balancer). |

### Recursos y verbos HTTP

En REST, los **recursos** (sustantivos) se identifican mediante URIs y las **acciones** (verbos) se expresan con métodos HTTP:

| Método HTTP | Semántica | Idempotente | Seguro |
|---|---|:---:|:---:|
| `GET` | Leer un recurso | ✓ | ✓ |
| `POST` | Crear un recurso nuevo | ✗ | ✗ |
| `PUT` | Reemplazar un recurso completo | ✓ | ✗ |
| `PATCH` | Modificar parcialmente un recurso | ✓* | ✗ |
| `DELETE` | Eliminar un recurso | ✓ | ✗ |

> **Idempotente**: ejecutar la misma operación N veces produce el mismo resultado que ejecutarla una sola vez.  
> **Seguro**: la operación no modifica el estado del servidor.

### Códigos de estado HTTP relevantes

| Código | Significado | Cuándo usarlo |
|---|---|---|
| `200 OK` | Éxito | GET, PUT, PATCH con respuesta en el body |
| `201 Created` | Recurso creado | POST exitoso |
| `204 No Content` | Éxito sin body | DELETE exitoso |
| `400 Bad Request` | Error del cliente | Datos inválidos o faltantes |
| `404 Not Found` | Recurso inexistente | ISBN no encontrado |
| `409 Conflict` | Conflicto de estado | ISBN duplicado en POST |
| `500 Internal Server Error` | Error inesperado del servidor | Errores no controlados |

---

## 2. Modelo de Madurez de Richardson

Leonard Richardson propuso en 2008 un modelo que clasifica las APIs HTTP en cuatro niveles según cuánto aprovechan las capacidades de HTTP y REST:

```
Nivel 0 ──► Nivel 1 ──► Nivel 2 ──► Nivel 3
  POX         Recursos    Verbos     HATEOAS
```

### Nivel 0 — "El pantano del POX"
Un único endpoint recibe todas las operaciones. El método HTTP no importa.

```
POST /api
{ "accion": "obtenerLibro", "isbn": "978-..." }
```

### Nivel 1 — Recursos
Se introducen URIs distintas para cada recurso, pero los verbos HTTP no se usan con semántica.

```
POST /libros/obtener
POST /libros/crear
POST /libros/eliminar/978-...
```

### Nivel 2 — Verbos HTTP
Se usan correctamente los métodos HTTP y los códigos de estado. Es el nivel más común en APIs reales.

```
GET    /books/978-...    → 200 OK
POST   /books            → 201 Created
DELETE /books/978-...    → 204 No Content
```

### Nivel 3 — HATEOAS ← *este ejemplo*
Las respuestas incluyen **hipervínculos** que describen las acciones posibles sobre el recurso en ese momento. El cliente no necesita "saber de antemano" qué URLs existen: las descubre en cada respuesta.

```json
{
  "isbn": "978-0-06-112008-4",
  "titulo": "Matar un ruiseñor",
  "_links": {
    "self":   { "href": "/books/978-0-06-112008-4", "method": "GET" },
    "update": { "href": "/books/978-0-06-112008-4", "method": "PUT" },
    "patch":  { "href": "/books/978-0-06-112008-4", "method": "PATCH" },
    "delete": { "href": "/books/978-0-06-112008-4", "method": "DELETE" },
    "list":   { "href": "/books", "method": "GET" }
  }
}
```

---

## 3. Entidad: Libro

```typescript
interface Book {
  isbn:    string;   // Clave primaria (identificador único del libro)
  titulo:  string;
  autor:   string;
  genero:  string;
  paginas: number;   // Entero positivo
}
```

El ISBN actúa como **clave natural**: tiene significado en el dominio y es único en el mundo, por eso se usa directamente en la URI (`/books/:isbn`).

---

## 4. Endpoints disponibles

### Base URL: `http://localhost:3000`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/books` | Listar libros (con filtros y paginación) |
| `GET` | `/books/:isbn` | Obtener un libro por ISBN |
| `POST` | `/books` | Crear un nuevo libro |
| `PUT` | `/books/:isbn` | Reemplazar un libro completo |
| `PATCH` | `/books/:isbn` | Actualizar uno o más campos |
| `DELETE` | `/books/:isbn` | Eliminar un libro |

### Parámetros de `GET /books`

| Query param | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `titulo` | string | Filtro parcial (LIKE) | `?titulo=1984` |
| `isbn` | string | Filtro parcial (LIKE) | `?isbn=978-0-06` |
| `page` | number | Número de página (default: 1) | `?page=2` |
| `limit` | number | Items por página (default: 10, máx: 100) | `?limit=5` |

### Diferencia entre PUT y PATCH

- **`PUT`** reemplaza el libro **completo**. Debes enviar todos los campos (`titulo`, `autor`, `genero`, `paginas`). Si omitís un campo, se perderá.
- **`PATCH`** actualiza **sólo los campos enviados**. El resto permanece igual.

```bash
# PUT: reemplaza todo (hay que enviar todos los campos)
PUT /books/978-...
{ "titulo": "Nuevo", "autor": "Autor", "genero": "Drama", "paginas": 300 }

# PATCH: sólo modifica el titulo
PATCH /books/978-...
{ "titulo": "Solo cambio esto" }
```

---

## 5. HATEOAS en la práctica

### Respuesta de `GET /books/:isbn`

```json
{
  "isbn": "978-0-06-112008-4",
  "titulo": "Matar un ruiseñor",
  "autor": "Harper Lee",
  "genero": "Ficción",
  "paginas": 281,
  "_links": {
    "self":   { "href": "http://localhost:3000/books/978-0-06-112008-4", "method": "GET" },
    "update": { "href": "http://localhost:3000/books/978-0-06-112008-4", "method": "PUT" },
    "patch":  { "href": "http://localhost:3000/books/978-0-06-112008-4", "method": "PATCH" },
    "delete": { "href": "http://localhost:3000/books/978-0-06-112008-4", "method": "DELETE" },
    "list":   { "href": "http://localhost:3000/books", "method": "GET" }
  }
}
```

### Respuesta de `GET /books?page=1&limit=2`

```json
{
  "data": [
    {
      "isbn": "978-0-06-112008-4",
      "titulo": "Matar un ruiseñor",
      "...",
      "_links": { "self": { "href": "...", "method": "GET" }, "..." }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 10,
    "totalPages": 5
  },
  "_links": {
    "self":   { "href": "http://localhost:3000/books?page=1&limit=2", "method": "GET" },
    "next":   { "href": "http://localhost:3000/books?page=2&limit=2", "method": "GET" },
    "prev":   null,
    "create": { "href": "http://localhost:3000/books", "method": "POST" }
  }
}
```

El cliente puede navegar la colección completa **sólo siguiendo los links `next` y `prev`**, sin conocer el formato de paginación de antemano.

---

## 6. Arquitectura en capas

El proyecto implementa una **arquitectura en capas** (Layered Architecture). Cada capa tiene una responsabilidad única y sólo se comunica con la capa inmediatamente inferior.

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Request                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                     Capa de Rutas (Routes)                      │
│  Define qué handler se ejecuta para cada método + URI.          │
│  No contiene lógica.                                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                  Capa de Controladores (Controllers)            │
│  Parsea el request (body, params, query).                       │
│  Valida la FORMA del input (campos requeridos, tipos).          │
│  Llama al servicio.                                             │
│  Construye el DTO de respuesta con _links HATEOAS.              │
│  Traduce errores de dominio → códigos HTTP.                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    Capa de Servicios (Services)                 │
│  Aplica reglas de negocio (unicidad ISBN, existencia, etc.)     │
│  Orquesta las llamadas al repositorio.                          │
│  Lanza errores de dominio (NotFoundError, ConflictError).       │
│  No conoce HTTP.                                                │
└──────────────────────┬──────────────────────┬───────────────────┘
                       │                      │
        ┌──────────────▼──────────┐  ┌────────▼────────────────┐
        │  Capa de Repositorio    │  │  Capa HATEOAS (Links)   │
        │  (Repository)           │  │                         │
        │  Toda la lógica SQL.    │  │  Construye los _links   │
        │  No conoce HTTP.        │  │  en el Controller.      │
        └──────────────┬──────────┘  └─────────────────────────┘
                       │
        ┌──────────────▼──────────┐
        │       SQLite (BD)       │
        └─────────────────────────┘
```

### Separación Controller vs Service

La distinción más importante del diseño:

| Responsabilidad | Controller | Service |
|---|:---:|:---:|
| Parsear `req.body`, `req.params`, `req.query` | ✓ | ✗ |
| Validar forma del input (campos, tipos) | ✓ | ✗ |
| Regla: "el ISBN debe ser único" | ✗ | ✓ |
| Regla: "sólo se puede editar un libro existente" | ✗ | ✓ |
| Llamar al repositorio | ✗ | ✓ |
| Lanzar `NotFoundError` / `ConflictError` | ✗ | ✓ |
| Traducir errores a `404` / `409` / `500` | ✓ | ✗ |
| Construir el DTO de respuesta con `_links` | ✓ | ✗ |

### Errores de dominio como contrato entre capas

El Service nunca devuelve `null` ni booleanos para indicar "no encontré el recurso". En cambio, lanza errores semánticos que el Controller captura:

```
Service lanza NotFoundError("No existe un libro con ISBN '...'")
                    │
                    ▼
Controller captura → res.status(404).json({ error: err.message })
```

Esto mantiene al Service completamente ignorante de HTTP. Si mañana el mismo servicio se usa desde una CLI o una cola de mensajes, su comportamiento no cambia.

### Principio de separación de responsabilidades (SRP)

Cada capa puede cambiar **independientemente** de las otras:

- ¿Cambias la BD de SQLite a PostgreSQL? Solo tocás el **Repositorio**.
- ¿Cambias una regla de negocio (ej: validar que el ISBN tenga formato correcto)? Solo tocás el **Servicio**.
- ¿Cambias la estructura de los `_links`? Solo tocás **HATEOAS**.
- ¿Cambias la validación del body o el formato de la respuesta? Solo tocás el **Controlador**.
- ¿Agregás una nueva ruta? Solo tocás **Routes** y quizás el **Controlador**.

---

## 7. Estructura del proyecto

```
03_api-rest/
│
├── src/                            ← Código fuente TypeScript
│   ├── app.ts                      ← Fábrica de la app Express + punto de entrada
│   ├── database.ts                 ← Inicialización de SQLite
│   │
│   ├── models/
│   │   └── book.ts                 ← Interfaces TypeScript (Book, BookInput, BookPatch)
│   │
│   ├── errors/
│   │   └── AppError.ts             ← Errores de dominio (NotFoundError, ConflictError)
│   │
│   ├── hateoas/
│   │   └── links.ts                ← Helpers para construir _links
│   │
│   ├── repositories/
│   │   └── booksRepository.ts      ← Queries SQL (findById, findAll, create, update, patch, delete)
│   │
│   ├── services/
│   │   └── booksService.ts         ← Reglas de negocio, orquesta el repositorio
│   │
│   ├── controllers/
│   │   └── booksController.ts      ← Parseo HTTP, validación de input, construye DTOs
│   │
│   └── routes/
│       └── books.ts                ← Mapeo verbo+URI → handler
│
├── tests/
│   └── books.test.ts               ← 21 tests de integración (SQLite :memory: + supertest)
│
├── dist/                           ← Código compilado (generado por `npm run build`)
│
├── jest.config.js                  ← Configuración de Jest + ts-jest
├── tsconfig.json                   ← Configuración TypeScript (src/)
├── tsconfig.test.json              ← Configuración TypeScript (src/ + tests/)
└── package.json
```

---

## 8. Descripción de cada capa

### `src/models/book.ts` — Modelos

Define las **formas de datos** (interfaces TypeScript) que circulan por la aplicación:

```typescript
interface Book       // Representa un libro completo (con isbn)
type BookInput       // Alias de Book: datos para crear un libro
type BookPatch       // Campos opcionales de Book sin isbn (para PATCH)
```

No contiene lógica, sólo tipos. Esto permite que TypeScript verifique en tiempo de compilación que las capas se pasan los datos correctos.

---

### `src/database.ts` — Inicialización de la base de datos

Expone una función `initDatabase(filename)` que:

1. Abre (o crea) el archivo SQLite.
2. Ejecuta el `CREATE TABLE IF NOT EXISTS` para asegurar que la tabla `books` existe.
3. Devuelve una `Promise<Database>` para poder usar `await` en el arranque.

El parámetro `filename` permite pasar `':memory:'` en los tests, lo que crea una base de datos **efímera en RAM** sin tocar el disco.

---

### `src/hateoas/links.ts` — Hipervínculos HATEOAS

Contiene dos funciones puras (sin efectos secundarios):

- **`bookLinks(isbn, req)`** → genera los `_links` para un libro individual (`self`, `update`, `patch`, `delete`, `list`).
- **`collectionLinks(req, page, limit, total, filters)`** → genera los `_links` de navegación para la colección (`self`, `next`, `prev`, `create`).

Ambas reciben el objeto `req` de Express para poder construir la URL absoluta (`http://host/...`) a partir del protocolo y host del request entrante.

---

### `src/errors/AppError.ts` — Errores de dominio

Define las clases de error que el **Servicio** lanza y el **Controlador** captura:

```typescript
class NotFoundError extends Error  // Libro no encontrado → HTTP 404
class ConflictError extends Error  // ISBN duplicado     → HTTP 409
```

Esta separación es clave: el Service expresa problemas en términos del **dominio** ("el libro no existe"), sin saber nada de HTTP. El Controller traduce ese problema a un **código de estado HTTP** (`404`).

---

### `src/repositories/booksRepository.ts` — Repositorio

Es la **única capa que habla con SQLite**. Expone métodos con nombres del dominio, no de SQL:

| Método | SQL equivalente |
|---|---|
| `findById(isbn)` | `SELECT * FROM books WHERE isbn = ?` |
| `findAll(filters, page, limit)` | `SELECT ... WHERE ... LIMIT ? OFFSET ?` |
| `create(book)` | `INSERT INTO books ...` |
| `update(isbn, book)` | `UPDATE books SET ... WHERE isbn = ?` |
| `patch(isbn, fields)` | `UPDATE books SET campo=? WHERE isbn = ?` |
| `delete(isbn)` | `DELETE FROM books WHERE isbn = ?` |

El repositorio devuelve `Promise` y no importa nada de Express ni de reglas de negocio. Si no encuentra una fila, devuelve `null` o `false`; es el **Service** quien decide si eso es un error.

---

### `src/services/booksService.ts` — Servicio

Es la capa de **lógica de negocio**. Para cada operación:

1. **Consulta** al repositorio para conocer el estado actual.
2. **Aplica** las reglas del dominio.
3. **Lanza** un error semántico si una regla no se cumple.
4. **Devuelve** objetos del dominio (`Book`), sin saber nada de HTTP.

Ejemplos de reglas implementadas:

```typescript
// Regla: el ISBN es único en el catálogo
async create(input: BookInput): Promise<Book> {
  const existing = await this.repo.findById(input.isbn);
  if (existing) throw new ConflictError(`Ya existe un libro con ISBN "${input.isbn}"`);
  return this.repo.create(input);
}

// Regla: sólo se puede editar un libro que existe
async update(isbn, data): Promise<Book> {
  const book = await this.repo.update(isbn, { isbn, ...data });
  if (!book) throw new NotFoundError(`No existe un libro con ISBN "${isbn}"`);
  return book;
}
```

---

### `src/controllers/booksController.ts` — Controladores

Capa delgada con responsabilidades exclusivamente HTTP:

1. **Extrae** datos del request (`req.params`, `req.query`, `req.body`).
2. **Valida la forma** del input (campos requeridos, tipos correctos).
3. **Delega** la operación al servicio.
4. **Construye** el DTO de respuesta (datos del dominio + `_links` HATEOAS).
5. **Traduce** los errores de dominio a códigos HTTP.

```typescript
private handleError(err: unknown, res: Response): void {
  if (err instanceof NotFoundError) res.status(404).json({ error: err.message });
  else if (err instanceof ConflictError) res.status(409).json({ error: err.message });
  else res.status(500).json({ error: 'Internal server error' });
}
```

El Controller **nunca llama directamente al repositorio**. Toda lógica de datos pasa por el Service.

---

### `src/routes/books.ts` — Rutas

Fábrica de router que recibe el controlador como dependencia:

```typescript
router.get('/',         controller.list);
router.get('/:isbn',    controller.getOne);
router.post('/',        controller.create);
router.put('/:isbn',    controller.update);
router.patch('/:isbn',  controller.patch);
router.delete('/:isbn', controller.delete);
```

Su única responsabilidad es **mapear** un verbo HTTP + URI a su handler. No tiene `if`, validaciones ni lógica de negocio.

---

### `src/app.ts` — Composición raíz

`createApp(db)` es la función que **ensambla** todas las capas:

```typescript
const repo       = new BooksRepository(db);
const service    = new BooksService(repo);
const controller = new BooksController(service);
app.use('/books', createBooksRouter(controller));
```

Este patrón se llama **Inyección de Dependencias manual**: en lugar de que cada capa cree sus dependencias internamente, las recibe como parámetros. Esto hace que el sistema sea **fácil de testear**: en tests se pasa una BD `:memory:`, en producción se pasa la BD en disco.

---

### `tests/books.test.ts` — Tests de integración

Los tests verifican el comportamiento del sistema **desde afuera**, haciendo requests HTTP reales contra la app con `supertest`, sin mockear nada.

Cada `describe` agrupa los tests de un endpoint. Antes de cada test se limpia la tabla (`DELETE FROM books`) para garantizar **aislamiento**: el resultado de un test no afecta a los demás.

```
✓ POST /books — crea y devuelve 201 con _links
✓ POST /books — devuelve 409 si el isbn ya existe
✓ POST /books — devuelve 400 si faltan campos
✓ GET  /books/:isbn — devuelve el libro con _links
✓ GET  /books — lista paginada con metadatos
✓ ...  (21 tests en total)
```

---

## 9. Cómo ejecutar el proyecto

### Requisitos

- Node.js 18+
- npm

### Instalación

```bash
npm install
```

### Modo desarrollo (compila + ejecuta)

```bash
npm run start:dev
```

### Modo producción

```bash
npm run build   # compila TypeScript a dist/
npm start       # ejecuta dist/app.js
```

El servidor queda escuchando en `http://localhost:3000`.

---

## 10. Cómo ejecutar los tests

```bash
npm test
```

Los tests usan una base de datos SQLite **en memoria** (`:memory:`), por lo que son completamente aislados del archivo `books.db` del servidor.

---

## 11. Ejemplos de uso con curl

### Crear un libro

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0-06-112008-4",
    "titulo": "Matar un ruiseñor",
    "autor": "Harper Lee",
    "genero": "Ficción",
    "paginas": 281
  }'
```

### Obtener un libro

```bash
curl http://localhost:3000/books/978-0-06-112008-4
```

### Listar libros paginados

```bash
curl "http://localhost:3000/books?page=1&limit=5"
```

### Filtrar por título

```bash
curl "http://localhost:3000/books?titulo=ruise%C3%B1or"
```

### Reemplazar un libro completo (PUT)

```bash
curl -X PUT http://localhost:3000/books/978-0-06-112008-4 \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "To Kill a Mockingbird",
    "autor": "Harper Lee",
    "genero": "Fiction",
    "paginas": 281
  }'
```

### Actualizar sólo el género (PATCH)

```bash
curl -X PATCH http://localhost:3000/books/978-0-06-112008-4 \
  -H "Content-Type: application/json" \
  -d '{ "genero": "Clásico" }'
```

### Eliminar un libro

```bash
curl -X DELETE http://localhost:3000/books/978-0-06-112008-4
```
