# Paso 3 — CRUD completo en memoria

## Qué se construye

Se completan los 6 endpoints del CRUD usando los verbos HTTP con su semántica correcta. Los datos siguen en un array en memoria.

| Método | Ruta | Código éxito | Descripción |
|---|---|---|---|
| `GET` | `/books` | 200 | Lista con filtro y paginación |
| `GET` | `/books/:isbn` | 200 | Obtener uno |
| `POST` | `/books` | 201 | Crear |
| `PUT` | `/books/:isbn` | 200 | Reemplazar completo |
| `PATCH` | `/books/:isbn` | 200 | Actualizar parcialmente |
| `DELETE` | `/books/:isbn` | 204 | Eliminar |

## Conceptos clave

- **`POST` → 201 Created**: se creó un nuevo recurso. El body devuelve el recurso creado.
- **`PUT` → 200 OK**: reemplaza el recurso **completo**. Hay que enviar todos los campos. Es **idempotente**: ejecutarlo dos veces con los mismos datos produce el mismo resultado.
- **`PATCH` → 200 OK**: modifica sólo los campos enviados. Los demás permanecen igual.
- **`DELETE` → 204 No Content**: el recurso fue eliminado. No hay body en la respuesta.
- **400 Bad Request**: el cliente envió datos inválidos o incompletos.
- **409 Conflict**: hay un conflicto de estado (ej: ISBN duplicado al crear).
- **Idempotencia**: una operación es idempotente si ejecutarla N veces produce el mismo efecto que ejecutarla una vez. GET, PUT y DELETE son idempotentes. POST no lo es.

### PUT vs PATCH

```
PUT /books/978-...
{ "titulo": "Nuevo", "autor": "Autor", "genero": "Drama", "paginas": 300 }
→ Reemplaza TODO. Si omitís un campo, se pierde.

PATCH /books/978-...
{ "titulo": "Nuevo" }
→ Solo modifica el título. Los demás campos no cambian.
```

## Archivos modificados

```
src/
  models/
    book.ts   ← agrega BookPatch (tipo para actualización parcial)
  app.ts      ← agrega POST, PUT, PATCH, DELETE + validaciones
```

## Cómo ejecutar

```bash
npm install
npm run start:dev
```

```bash
# Crear
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"isbn":"978-0-14-303943-3","titulo":"El proceso","autor":"Franz Kafka","genero":"Absurdismo","paginas":255}'

# Reemplazar completo
curl -X PUT http://localhost:3000/books/978-0-14-303943-3 \
  -H "Content-Type: application/json" \
  -d '{"titulo":"The Trial","autor":"Franz Kafka","genero":"Absurdismo","paginas":255}'

# Actualizar solo el género
curl -X PATCH http://localhost:3000/books/978-0-14-303943-3 \
  -H "Content-Type: application/json" \
  -d '{"genero":"Modernismo"}'

# Eliminar
curl -X DELETE http://localhost:3000/books/978-0-14-303943-3
```

## 📝 Para tener en cuenta

- El `app.ts` ya tiene casi 120 líneas y mezcla tres cosas distintas: definición de rutas, lógica de negocio y acceso a datos. El paso siguiente resuelve esto separando responsabilidades en capas.
- Los datos se pierden cuando el servidor se reinicia. El paso 4 agrega persistencia con SQLite.
