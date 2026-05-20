# Ejercicios: Async / Await

> 

---

## Tabla de Contenidos

1. [Mi primera función async](#ejercicio-1--mi-primera-función-async)
2. [Obtener un recurso simple](#ejercicio-2--obtener-un-recurso-simple)
3. [Parámetro dinámico y errores HTTP](#ejercicio-3--parámetro-dinámico-y-errores-http)
4. [Transformar datos](#ejercicio-4--transformar-datos)
5. [Múltiples llamadas secuenciales](#ejercicio-5--múltiples-llamadas-secuenciales)
6. [Múltiples llamadas en paralelo](#ejercicio-6--múltiples-llamadas-en-paralelo)
7. [Crear un recurso con POST](#ejercicio-7--crear-un-recurso-con-post)

---

## Ejercicio 1 — Mi primera función async

### Objetivo

Entender que `async/await` es otra forma de escribir Promesas: una función `async` siempre retorna una Promesa, y `await` pausa su ejecución hasta que la promesa se resuelve.

### Enunciado

Reescribir la función `esperar` de los ejercicios anteriores de dos formas:

1. Una función auxiliar `pausar(ms)` que retorne una `Promise` base usando `new Promise` y `setTimeout`.
2. Una función `esperar(segundos)` marcada como `async` que use `await` internamente sobre `pausar`, y retorne el mensaje `"¡Listo! Esperé X segundos"`.

Llamar a `esperar` desde una función `main` también `async`, agregando logs antes y después del `await` para observar el orden de ejecución.

### Firma esperada

```typescript
function pausar(ms: number): Promise<void> {
  // Promesa base con setTimeout
}

async function esperar(segundos: number): Promise<string> {
  // Usa await pausar() internamente
  // Retorna el mensaje directamente (sin resolve)
}

async function main(): Promise<void> {
  console.log("01 - Inicio de main");
  const resultado = await esperar(2000);
  console.log(`02 - ${resultado}`);
  console.log("03 - Fin de main");
}

main();
```

### Output esperado

```
01 - Inicio de main
// ...2 segundos después...
02 - ¡Listo! Esperé 2 segundos
03 - Fin de main
```

### Para reflexionar

- ¿Qué tipo retorna `esperar()` si la llamás sin `await`? Comprobarlo en consola.
- ¿Qué diferencia hay entre `return mensaje` dentro de una función `async` y `resolve(mensaje)` dentro de un `new Promise`?

---

## Ejercicio 2 — Obtener un recurso simple

### Objetivo

Escribir la primera llamada a una API externa con `async/await` y manejar errores con `try/catch`.

### Enunciado

Escribir una función `async` llamada `obtenerPost()` que:

1. Consulte el siguiente endpoint:
   
   ```
   GET https://jsonplaceholder.typicode.com/posts/1
   ```

2. Parsee la respuesta como JSON.

3. Imprima el título y el cuerpo del post con el formato:
   
   ```
   Título: [titulo]
   Cuerpo: [cuerpo]
   ```

4. Maneje cualquier error con `try/catch`, imprimiendo un mensaje descriptivo.

### Firma esperada

```typescript
async function obtenerPost(): Promise<void> {
  try {
    // tu código aquí
  } catch (error) {
    // tu código aquí
  }
}

obtenerPost();
```

### Estructura de la respuesta

```json
{
  "id": 1,
  "userId": 1,
  "title": "sunt aut facere repellat provident...",
  "body": "quia et suscipit\nsuscipit recusandae..."
}
```

### Pistas

- `await fetch(url)` retorna un objeto `Response`. Para obtener el JSON hay que hacer un segundo `await`: `await respuesta.json()`.
- Para probar el `catch`, cambiar la URL por una inventada.

---

## Ejercicio 3 — Parámetro dinámico y errores HTTP

### Objetivo

Practicar funciones `async` reutilizables con parámetros, y aprender a detectar errores HTTP que `fetch` no lanza automáticamente.

### Enunciado

Escribir una función `obtenerUsuario(id)` que:

1. Reciba un `id` por parámetro y consulte:
   
   ```
   GET https://jsonplaceholder.typicode.com/users/{id}
   ```

2. Verifique si la respuesta fue exitosa usando `respuesta.ok`. Si no lo fue, lance un error con el mensaje `"Usuario no encontrado. Status: [status]"`.

3. Retorne el objeto del usuario parseado como JSON.

4. Maneje errores con `try/catch`.

Llamar a la función dos veces: una con el ID `2` (válido) y otra con el ID `999` (que no existe).

### Firma esperada

```typescript
interface Usuario {
  id: number;
  name: string;
  email: string;
  phone: string;
}

async function obtenerUsuario(id: number): Promise<Usuario> {
  // tu código aquí
}

// Llamada con ID válido
obtenerUsuario(2)
  .then((usuario) => console.log(`Nombre: ${usuario.name} | Email: ${usuario.email}`))
  .catch((error)  => console.error(error.message));

// Llamada con ID inválido
obtenerUsuario(999)
  .then((usuario) => console.log(`Nombre: ${usuario.name}`))
  .catch((error)  => console.error(error.message));
```

### Output esperado

```
Nombre: Ervin Howell | Email: Shanna@melissa.tv
Usuario no encontrado. Status: 404
```

### ⚠️ Dato importante

`fetch` solo lanza un error automáticamente ante problemas de red (sin conexión, URL inválida). Un status `404` o `500` **no lanza un error** — la promesa se resuelve igual. Por eso es necesario verificar `respuesta.ok` manualmente.

---

## Ejercicio 4 — Transformar datos

### Objetivo

Practicar el procesamiento y transformación de datos dentro de una función `async`.

### Enunciado

Escribir una función `async` llamada `obtenerTitulosDeUsuario(userId)` que:

1. Consulte todos los posts:
   
   ```
   GET https://jsonplaceholder.typicode.com/posts
   ```

2. Filtre solo los posts cuyo `userId` coincida con el parámetro recibido.

3. Retorne un array con solo los títulos de esos posts (array de `string`).

4. Maneje errores con `try/catch`.

Llamarla con `userId = 1` e imprimir el array resultante.

### Firma esperada

```typescript
async function obtenerTitulosDeUsuario(userId: number): Promise<string[]> {
  // tu código aquí
}

obtenerTitulosDeUsuario(1)
  .then((titulos) => {
    console.log(`Posts del usuario 1 (${titulos.length} en total):`);
    titulos.forEach((titulo, i) => console.log(`  ${i + 1}. ${titulo}`));
  })
  .catch((error) => console.error(error.message));
```

### Output esperado (parcial)

```
Posts del usuario 1 (10 en total):
  1. sunt aut facere repellat provident occaecati...
  2. qui est esse
  3. ea molestiae et quasi eos aperiam iusto...
  ...
```

### Para reflexionar

- ¿En qué parte del código ocurre el asincronismo? ¿El `filter` y el `map` son asincrónicos?
- ¿Qué pasaría si quisieras también obtener el nombre del usuario cuyo `userId` recibiste? ¿Cómo modificarías la función?

---

## Ejercicio 5 — Múltiples llamadas secuenciales

### Objetivo

Ver cómo `async/await` hace legible un flujo con múltiples operaciones asincrónicas dependientes entre sí.

### Enunciado

Escribir una función `obtenerPerfilCompleto(userId)` que realice **tres llamadas secuenciales**:

1. Obtener el usuario desde `/users/{userId}`.
2. Obtener sus posts desde `/posts?userId={userId}`.
3. Obtener sus tareas desde `/todos?userId={userId}`.

Retornar un objeto con la forma:

```typescript
{
  usuario: { id, name, email },
  totalPosts: number,
  tareasCompletadas: number,
  tareasPendientes: number
}
```

Manejar errores con `try/catch`.

### Firma esperada

```typescript
interface PerfilCompleto {
  usuario: {
    id: number;
    name: string;
    email: string;
  };
  totalPosts: number;
  tareasCompletadas: number;
  tareasPendientes: number;
}

async function obtenerPerfilCompleto(userId: number): Promise<PerfilCompleto> {
  // tu código aquí
}

obtenerPerfilCompleto(1)
  .then((perfil) => {
    console.log(`Usuario:            ${perfil.usuario.name}`);
    console.log(`Email:              ${perfil.usuario.email}`);
    console.log(`Total de posts:     ${perfil.totalPosts}`);
    console.log(`Tareas completadas: ${perfil.tareasCompletadas}`);
    console.log(`Tareas pendientes:  ${perfil.tareasPendientes}`);
  })
  .catch((error) => console.error(error.message));
```

### Output esperado

```
Usuario:            Leanne Graham
Email:              Sincere@april.biz
Total de posts:     10
Tareas completadas: 11
Tareas pendientes:  9
```

### Pistas

- Para filtrar posts y todos por userId: `/posts?userId=1` y `/todos?userId=1`.
- Para contar las tareas completadas: `todos.filter((t) => t.completed).length`.
- Las tres llamadas son **secuenciales** en este ejercicio — cada una espera a que la anterior termine. En el siguiente ejercicio las haremos en paralelo.

---

## Ejercicio 6 — Múltiples llamadas en paralelo

### Objetivo

Entender cuándo conviene ejecutar llamadas asincrónicas en paralelo en lugar de secuencialmente, y medir la diferencia de tiempo en la práctica.

### Enunciado

Reescribir la función `obtenerPerfilCompleto` del Ejercicio 5 en una nueva función `obtenerPerfilCompletoParalelo(userId)` que haga las **tres llamadas al mismo tiempo** usando `Promise.all()`.

El resultado debe ser idéntico al del Ejercicio 5. Medir el tiempo de ambas funciones usando `console.time` / `console.timeEnd` y comparar.

### Firma esperada

```typescript
async function obtenerPerfilCompletoParalelo(userId: number): Promise<PerfilCompleto> {
  // Las tres llamadas deben lanzarse al mismo tiempo con Promise.all()
}

// Medir versión secuencial
console.time("secuencial");
await obtenerPerfilCompleto(1).then(() => console.timeEnd("secuencial"));

// Medir versión paralela
console.time("paralelo");
await obtenerPerfilCompletoParalelo(1).then(() => console.timeEnd("paralelo"));
```

### Output esperado

```
secuencial: ~900ms
paralelo:   ~300ms
```

### Para reflexionar

- ¿Por qué en este caso podemos usar `Promise.all()` pero en el Ejercicio 5 no?
- ¿Qué pasaría si una de las tres llamadas fallara? ¿Cómo se comporta `Promise.all()` en ese caso?
- ¿En qué escenarios real las llamadas **no** podrían hacerse en paralelo?

---

## Ejercicio 7 — Crear un recurso con POST

### Objetivo

Practicar llamadas `async/await` que envían datos al servidor, no solo los reciben.

### Enunciado

Escribir una función `crearPost(titulo, cuerpo, userId)` que:

1. Haga una petición `POST` a:
   
   ```
   POST https://jsonplaceholder.typicode.com/posts
   ```

2. Envíe en el cuerpo de la petición un objeto JSON con `title`, `body` y `userId`.

3. Verifique que la respuesta fue exitosa con `respuesta.ok`.

4. Retorne el objeto creado que devuelve la API (que incluye el `id` asignado).

5. Maneje errores con `try/catch`.

### Firma esperada

```typescript
interface NuevoPost {
  title: string;
  body: string;
  userId: number;
}

interface PostCreado extends NuevoPost {
  id: number;
}

async function crearPost(
  titulo: string,
  cuerpo: string,
  userId: number
): Promise<PostCreado> {
  // tu código aquí
}

crearPost("Mi primer post", "Este es el contenido del post", 1)
  .then((post) => {
    console.log("✅ Post creado:");
    console.log(`   ID:     ${post.id}`);
    console.log(`   Título: ${post.title}`);
    console.log(`   User:   ${post.userId}`);
  })
  .catch((error) => console.error("❌ Error:", error.message));
```

### Output esperado

```
✅ Post creado:
   ID:     101
   Título: Mi primer post
   User:   1
```

### Pistas

- `fetch` acepta un segundo argumento con las opciones de la petición:
  
  ```typescript
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body, userId })
  })
  ```

- `jsonplaceholder` es una API de prueba — no guarda los datos realmente, pero simula la respuesta como si lo hiciera. El ID retornado siempre será `101`.

---

## Resumen de ejercicios

| #   | Concepto principal                                     | API utilizada                    |
| --- | ------------------------------------------------------ | -------------------------------- |
| 1   | `async/await` interno, función auxiliar con Promise    | —                                |
| 2   | Primera llamada con `async/await`, `try/catch`         | `GET /posts/1`                   |
| 3   | Parámetro dinámico, verificación de `respuesta.ok`     | `GET /users/{id}`                |
| 4   | Transformación de datos dentro de función `async`      | `GET /posts`                     |
| 5   | Múltiples `await` secuenciales, objeto de resultado    | `GET /users`, `/posts`, `/todos` |
| 6   | `Promise.all()` con `async/await`, medición de tiempos | `GET /users`, `/posts`, `/todos` |
| 7   | Petición `POST`, envío de datos con `fetch`            | `POST /posts`                    |
