# Paso 6 — HATEOAS (Nivel 3 del Modelo de Madurez de Richardson)

## Qué se construye

Se agregan hipervínculos (`_links`) a todas las respuestas de la API, alcanzando el **nivel 3** del Modelo de Madurez de Richardson.

La funcionalidad y arquitectura son idénticas al paso 5. Lo que se agrega es la capacidad de que el cliente **descubra** qué puede hacer a continuación leyendo la respuesta.

## El Modelo de Madurez de Richardson

| Nivel | Nombre | Qué agrega |
|---|---|---|
| 0 | POX | Un único endpoint para todo |
| 1 | Recursos | URIs distintas por recurso |
| 2 | Verbos HTTP | Uso correcto de GET/POST/PUT/PATCH/DELETE |
| **3** | **HATEOAS** | **Links en las respuestas** |

## Conceptos clave

**HATEOAS** (Hypermedia As The Engine Of Application State): cada respuesta incluye los links hacia las acciones posibles sobre ese recurso en ese momento.

```json
{
  "isbn": "978-0-45-228285-0",
  "titulo": "1984",
  "_links": {
    "self":   { "href": "http://localhost:3000/books/978-0-45-228285-0", "method": "GET" },
    "update": { "href": "http://localhost:3000/books/978-0-45-228285-0", "method": "PUT" },
    "patch":  { "href": "http://localhost:3000/books/978-0-45-228285-0", "method": "PATCH" },
    "delete": { "href": "http://localhost:3000/books/978-0-45-228285-0", "method": "DELETE" },
    "list":   { "href": "http://localhost:3000/books", "method": "GET" }
  }
}
```

**¿Qué problema resuelve?**

Sin HATEOAS, el cliente necesita conocer de antemano todas las URLs y verbos disponibles (documentación hardcodeada). Con HATEOAS, el cliente puede navegar la API siguiendo los links sin necesidad de conocer su estructura.

**Links de paginación** en la colección:

```json
{
  "data": [ ... ],
  "_links": {
    "self":   { "href": "/books?page=1&limit=5", "method": "GET" },
    "next":   { "href": "/books?page=2&limit=5", "method": "GET" },
    "prev":   null,
    "create": { "href": "/books", "method": "POST" }
  }
}
```

El cliente puede paginar la colección completa solo siguiendo `_links.next` y `_links.prev`, sin saber cómo se construye la URL.

## Archivos nuevos

```
src/
  hateoas/
    links.ts               ← bookLinks() y collectionLinks(): funciones puras
  controllers/
    booksController.ts     ← actualizado: agrega _links a cada respuesta
```

## Por qué `links.ts` es una capa separada

Los links son parte de la **respuesta HTTP**, no de la lógica de negocio. Separarlos en su propio módulo permite:
- Cambiar el formato de los links sin tocar el controlador.
- Testear la generación de links de forma aislada.
- Reutilizar `bookLinks()` desde cualquier endpoint que devuelva un libro.

## Cómo ejecutar

```bash
npm install
npm run start:dev
```

```bash
# Observá los _links en la respuesta
curl http://localhost:3000/books/978-0-45-228285-0

# Observá next/prev en la paginación
curl "http://localhost:3000/books?page=1&limit=2"
```

## Este es el proyecto final

Este paso contiene la versión completa del proyecto con todas las capas:

```
Routes → Controllers → Services → Repository → SQLite
                   ↘
               HATEOAS Links
```
