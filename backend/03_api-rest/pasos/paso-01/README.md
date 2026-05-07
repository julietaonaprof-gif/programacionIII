# Paso 1 — Servidor Express básico

## Qué se construye

El punto de partida: un servidor HTTP con Express y TypeScript que responde a un único endpoint `GET /`.

No hay base de datos, no hay recursos, no hay rutas complejas. El objetivo es entender la estructura mínima necesaria para que un servidor HTTP funcione.

## Conceptos clave

- **Express**: framework que simplifica la creación de servidores HTTP en Node.js.
- **Handler**: función que recibe un `Request` y un `Response` y decide qué devolver.
- **`app.listen(port)`**: arranca el servidor y lo pone a escuchar en un puerto.
- **`res.json()`**: serializa un objeto JavaScript como JSON y lo envía con el header `Content-Type: application/json`.
- **`express.json()`**: middleware que parsea el body de los requests entrantes como JSON.

## Archivos

```
src/
  app.ts   ← todo el código vive aquí por ahora
```

## Cómo ejecutar

```bash
npm install
npm run start:dev
```

Luego probá en el navegador o con curl:

```bash
curl http://localhost:3000/
```

Respuesta esperada:

```json
{ "mensaje": "Bienvenido a la API de Libros", "version": "1.0.0" }
```

## 📝 Para tener en cuenta

- `_req` lleva un guión bajo porque TypeScript nos avisa que la variable no se usa. Eso es una convención para ignorarla intencionalmente.
- El servidor no hace nada útil todavía. En el paso siguiente empezamos a modelar el recurso `Book`.
