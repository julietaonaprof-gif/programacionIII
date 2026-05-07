# Paso 4 — Arquitectura en capas + SQLite

## Qué se construye

Se refactoriza el código del paso 3 en tres capas independientes y se reemplaza el array en memoria por una base de datos SQLite real.

```
Routes → Controllers → Repository → SQLite
```

La funcionalidad es idéntica al paso 3. Lo que cambia es **cómo está organizado el código**.

## Conceptos clave

### Separación de responsabilidades (SRP)

Cada archivo tiene una única razón para cambiar:

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Rutas | `routes/books.ts` | Mapear verbo+URI → handler |
| Controlador | `controllers/booksController.ts` | Parsear request, validar input, construir respuesta |
| Repositorio | `repositories/booksRepository.ts` | Ejecutar queries SQL |
| Base de datos | `database.ts` | Conectar y crear la tabla |

### Patrón Repository

El repositorio es la única capa que "habla" con SQLite. El controlador no sabe si los datos vienen de SQLite, PostgreSQL o un archivo. Si mañana cambiamos de base de datos, solo tocamos el repositorio.

### Inyección de dependencias

`createApp(db)` recibe la instancia de la base de datos como parámetro en lugar de crearla internamente. Esto permite pasar una base de datos `:memory:` en los tests sin modificar el código de producción.

```typescript
const repo       = new BooksRepository(db);
const controller = new BooksController(repo);   // el controller NO crea el repo
app.use('/books', createBooksRouter(controller));
```

### `async/await` con SQLite

SQLite en Node.js usa callbacks. Los envolvemos en `Promise` para poder usar `async/await` en el controlador:

```typescript
findById(isbn: string): Promise<Book | null> {
  return new Promise((resolve, reject) => {
    this.db.get('SELECT * FROM books WHERE isbn = ?', [isbn], (err, row) => {
      if (err) return reject(err);
      resolve(row as Book ?? null);
    });
  });
}
```

## Archivos nuevos

```
src/
  database.ts                      ← initDatabase(): conecta SQLite y crea la tabla
  repositories/
    booksRepository.ts             ← todas las queries SQL
  controllers/
    booksController.ts             ← handlers HTTP, llama al repositorio
  routes/
    books.ts                       ← mapeo verbo+URI → controller
  app.ts                           ← createApp(db) + arranque del servidor
```

## Cómo ejecutar

```bash
npm install
npm run start:dev
```

Se crea automáticamente un archivo `books.db` en el directorio del paso.

```bash
# Crear un libro
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"isbn":"978-0-06-112008-4","titulo":"Matar un ruiseñor","autor":"Harper Lee","genero":"Ficción","paginas":281}'

# Reiniciá el servidor → los datos persisten (a diferencia del paso 3)
```

## Qué notar

- El controlador todavía mezcla lógica de negocio (¿existe el ISBN?) con lógica HTTP. El paso 5 resuelve esto con una capa de servicios.
- `app.ts` exporta `createApp(db)` para facilitar los tests, y el bloque `if (require.main === module)` arranca el servidor cuando se ejecuta directamente.
