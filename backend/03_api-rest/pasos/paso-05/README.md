# Paso 5 — Capa de servicios y errores de dominio

## Qué se construye

Se introduce una capa de servicios entre el controlador y el repositorio. La lógica de negocio migra al servicio; el controlador queda con responsabilidades exclusivamente HTTP.

```
Routes → Controllers → Services → Repository → SQLite
```

La funcionalidad sigue siendo idéntica. Lo que cambia es dónde vive cada tipo de lógica.

## El problema del paso anterior

En el paso 4, el controlador mezclaba dos tipos de lógica distintos:

```typescript
// Lógica de negocio (¿debería estar en el controller?)
const existing = await this.repo.findById(isbn);
if (existing) {
  res.status(409).json({ error: '...' });  // HTTP
  return;
}

// Acceso a datos (¿debería estar en el controller?)
const book = await this.repo.create({ isbn, titulo, autor, genero, paginas });
```

El controlador tomaba decisiones de negocio ("¿puede crearse este libro?") y además sabía cómo hablar con la base de datos. Dos razones para cambiar → viola el SRP.

## La solución: errores de dominio

El servicio expresa los problemas en términos del **dominio**, no de HTTP:

```typescript
// Service: habla en términos del negocio
async create(input: BookInput): Promise<Book> {
  const existing = await this.repo.findById(input.isbn);
  if (existing) throw new ConflictError(`Ya existe un libro con ISBN "${input.isbn}"`);
  return this.repo.create(input);
}
```

```typescript
// Controller: traduce errores de dominio a HTTP
private handleError(err: unknown, res: Response): void {
  if (err instanceof NotFoundError)  res.status(404).json({ error: err.message });
  if (err instanceof ConflictError)  res.status(409).json({ error: err.message });
  else                               res.status(500).json({ error: 'Internal server error' });
}
```

## Conceptos clave

- **Lógica de negocio**: reglas del dominio ("el ISBN debe ser único", "no se puede editar un libro que no existe"). Vive en el **servicio**.
- **Lógica HTTP**: parsear request, construir response, códigos de estado. Vive en el **controlador**.
- **Error de dominio**: clase que extiende `Error` con semántica del negocio, sin ninguna referencia a HTTP.
- **Por qué importa**: el servicio puede reutilizarse desde una CLI, una tarea programada o una cola de mensajes sin cambiar una línea, porque no conoce HTTP.

## Archivos nuevos

```
src/
  errors/
    AppError.ts            ← NotFoundError, ConflictError
  services/
    booksService.ts        ← reglas de negocio, orquesta el repositorio
  controllers/
    booksController.ts     ← actualizado: llama al service, no al repo
  app.ts                   ← actualizado: wiring Repository → Service → Controller
```

## Cómo ejecutar

```bash
npm install
npm run start:dev
```

El comportamiento externo es exactamente el mismo que en el paso 4. La diferencia es interna: la responsabilidad de cada pieza de código está mejor definida.

## Qué notar

- El controlador ya no hace `import` del repositorio. Solo conoce el servicio.
- El servicio ya no hace `import` de Express. No conoce `Request` ni `Response`.
- `handleError()` centraliza en un solo lugar la traducción de errores de dominio a códigos HTTP.
