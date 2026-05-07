# Paso 2 — Primer recurso REST con datos en memoria

## Qué se construye

Se modela el recurso `Book` y se exponen dos endpoints de **lectura**:

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/books` | Lista todos los libros (con filtro opcional por título) |
| `GET` | `/books/:isbn` | Obtiene un libro por su ISBN |

Los datos viven en un array en memoria (todavía no hay base de datos).

## Conceptos clave

- **Recurso**: cualquier entidad del dominio que queremos exponer a través de la API. En REST, cada recurso se identifica con una URI.
- **URI del recurso**: `/books` representa la colección; `/books/:isbn` representa un elemento individual.
- **`req.params`**: contiene los segmentos variables de la URI (`:isbn` → `req.params.isbn`).
- **`req.query`**: contiene los parámetros de query string (`?titulo=1984` → `req.query.titulo`).
- **Código 200 OK**: la operación fue exitosa y hay datos en la respuesta.
- **Código 404 Not Found**: el recurso solicitado no existe.
- **Interfaz TypeScript**: define la *forma* del dato. Si el compilador acepta el código, los datos tienen la estructura correcta.

## Archivos nuevos

```
src/
  models/
    book.ts   ← interfaz Book (isbn, titulo, autor, genero, paginas)
  app.ts      ← actualizado: dos rutas GET + array en memoria
```

## Cómo ejecutar

```bash
npm install
npm run start:dev
```

```bash
# Listar todos
curl http://localhost:3000/books

# Filtrar por título (búsqueda parcial)
curl "http://localhost:3000/books?titulo=1984"

# Obtener uno
curl http://localhost:3000/books/978-0-45-228285-0

# ISBN inexistente → 404
curl http://localhost:3000/books/no-existe
```

## 📝 Para tener en cuenta

- Todo el código (rutas + datos + lógica) vive en `app.ts`. Funciona, pero a medida que crezca el CRUD se volverá difícil de mantener. Los pasos siguientes irán separando responsabilidades.
- El ISBN es la **clave natural** del recurso: tiene significado en el dominio y es único en el mundo, por eso aparece directamente en la URI.
