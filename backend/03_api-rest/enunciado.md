# Ejercicio — API REST para un catálogo de libros

## Contexto

Tenés que construir una **API REST** en Node.js + TypeScript para gestionar un catálogo de libros. La API debe seguir el **Modelo de Madurez de Richardson nivel 3** (HATEOAS), usar **Express** como framework HTTP, y **SQLite** como base de datos.

El código se organiza en una **arquitectura en capas**: Routes → Controllers → Services → Repository → SQLite.

---

## Entidad: Libro

```typescript
interface Book {
  isbn:    string;   // Clave primaria (identificador único, se usa en la URI)
  titulo:  string;
  autor:   string;
  genero:  string;
  paginas: number;   // Entero positivo
}
```

---

## Endpoints requeridos

Base URL: `http://localhost:3000`

| Método   | Ruta           | Descripción                            |
|----------|----------------|----------------------------------------|
| `GET`    | `/books`       | Listar libros con filtros y paginación |
| `GET`    | `/books/:isbn` | Obtener un libro por ISBN              |
| `POST`   | `/books`       | Crear un nuevo libro                   |
| `PUT`    | `/books/:isbn` | Reemplazar un libro completo           |
| `PATCH`  | `/books/:isbn` | Actualizar uno o más campos            |
| `DELETE` | `/books/:isbn` | Eliminar un libro                      |

### Parámetros de `GET /books`

| Query param | Tipo   | Descripción                          | Ejemplo         |
|-------------|--------|--------------------------------------|-----------------|
| `titulo`    | string | Filtro parcial (LIKE)                | `?titulo=1984`  |
| `isbn`      | string | Filtro parcial (LIKE)                | `?isbn=978-0`   |
| `page`      | number | Número de página (default: 1)        | `?page=2`       |
| `limit`     | number | Items por página (default: 10, máx: 100) | `?limit=5`  |

---

## Códigos de estado HTTP esperados

| Situación | Código |
|---|---|
| GET / PUT / PATCH exitoso | `200 OK` |
| POST exitoso (libro creado) | `201 Created` |
| DELETE exitoso | `204 No Content` |
| Datos inválidos o faltantes | `400 Bad Request` |
| Libro no encontrado | `404 Not Found` |
| ISBN duplicado en POST | `409 Conflict` |
| Error inesperado del servidor | `500 Internal Server Error` |

---

## HATEOAS — Hipervínculos en las respuestas

Todas las respuestas deben incluir un campo `_links` con las acciones disponibles sobre el recurso.

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
  "data": [ /* array de libros, cada uno con sus _links */ ],
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

> El link `prev` debe ser `null` en la primera página. El link `next` debe ser `null` en la última.

---

## Arquitectura requerida

El proyecto debe organizarse en las siguientes capas bajo `src/`:

```
src/
├── app.ts                        ← Ensambla la app Express (createApp)
├── database.ts                   ← Inicializa SQLite (initDatabase)
├── models/
│   └── book.ts                   ← Interfaces: Book, BookInput, BookPatch
├── errors/
│   └── AppError.ts               ← Errores de dominio: NotFoundError, ConflictError
├── hateoas/
│   └── links.ts                  ← Helpers: bookLinks(), collectionLinks()
├── repositories/
│   └── booksRepository.ts        ← Queries SQL: findById, findAll, create, update, patch, delete
├── services/
│   └── booksService.ts           ← Reglas de negocio, orquesta el repositorio
├── controllers/
│   └── booksController.ts        ← Parseo HTTP, validación de input, construye DTOs
└── routes/
    └── books.ts                  ← Mapeo verbo+URI → handler
```

### Responsabilidades por capa

**`models/`** — solo tipos TypeScript, sin lógica.

**`errors/`** — clases de error que hereden de `Error`:
- `NotFoundError` → el Controller la traduce a `404`
- `ConflictError` → el Controller la traduce a `409`

**`hateoas/`** — funciones puras que reciben el objeto `req` de Express para construir URLs absolutas:
- `bookLinks(isbn, req)` → links para un libro individual
- `collectionLinks(req, page, limit, total, filters)` → links de navegación de la colección

**`repositories/`** — única capa que ejecuta SQL. Devuelve `null`/`false` si no encuentra datos; no lanza errores de dominio.

**`services/`** — aplica reglas de negocio y lanza `NotFoundError` / `ConflictError` cuando corresponde. No conoce HTTP.

**`controllers/`** — extrae datos del request, valida la forma del input, delega al service, construye la respuesta con `_links`, traduce errores de dominio a códigos HTTP.

**`routes/`** — solo mapea verbo+URI a su handler. Sin lógica.

**`app.ts`** — función `createApp(db)` que ensambla las capas con inyección de dependencias manual:

```typescript
const repo       = new BooksRepository(db);
const service    = new BooksService(repo);
const controller = new BooksController(service);
app.use('/books', createBooksRouter(controller));
```

**`database.ts`** — función `initDatabase(filename)` que abre (o crea) el archivo SQLite, crea la tabla `books` si no existe, y devuelve una `Promise<Database>`. Debe aceptar `':memory:'` para los tests.

---

## Diferencia entre PUT y PATCH

- **`PUT`** reemplaza el libro completo. Se deben enviar todos los campos. Si falta alguno, la request es inválida (`400`).
- **`PATCH`** actualiza solo los campos enviados. El resto permanece igual.

---

## Tests de integración

Implementar tests de integración en `tests/books.test.ts` usando **supertest** y una base de datos SQLite **en memoria** (`:memory:`). Los tests deben verificar al menos:

- `POST /books` — crea y devuelve `201` con `_links`
- `POST /books` — devuelve `409` si el ISBN ya existe
- `POST /books` — devuelve `400` si faltan campos
- `GET /books/:isbn` — devuelve el libro con `_links`
- `GET /books/:isbn` — devuelve `404` si no existe
- `GET /books` — devuelve lista paginada con metadatos y `_links`
- `GET /books` — filtra por `titulo`
- `PUT /books/:isbn` — reemplaza el libro completo
- `PUT /books/:isbn` — devuelve `404` si no existe
- `PATCH /books/:isbn` — actualiza solo los campos enviados
- `DELETE /books/:isbn` — devuelve `204`
- `DELETE /books/:isbn` — devuelve `404` si no existe

Cada test debe limpiar la tabla antes de ejecutarse para garantizar aislamiento.

---

## Cómo ejecutar

```bash
npm install
npm run start:dev   # modo desarrollo
npm test            # tests de integración
```
