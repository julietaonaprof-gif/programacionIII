# Ejercicios Introductorios: Callbacks y Promesas

> 

---

## Tabla de Contenidos

**Callbacks**

1. [Mi primer callback](#ejercicio-1--mi-primer-callback)
2. [Operación asincrónica simple](#ejercicio-2--operación-asincrónica-simple)
3. [Error-first callback](#ejercicio-3--error-first-callback)
4. [Dos callbacks encadenados](#ejercicio-4--dos-callbacks-encadenados)
5. [Identificar el problema](#ejercicio-5--identificar-el-problema)

**Promesas**

6. [Mi primera Promesa](#ejercicio-6--mi-primera-promesa)
7. [Resolver y rechazar](#ejercicio-7--resolver-y-rechazar)
8. [Refactorizar dividir](#ejercicio-8--refactorizar-dividir)
9. [Encadenar dos Promesas](#ejercicio-9--encadenar-dos-promesas)
10. [Consumir una API](#ejercicio-10--consumir-una-api)

---

## Ejercicio 1 — Mi primer callback

### Objetivo

Entender que un callback es simplemente una función que se pasa como argumento a otra función.

### Enunciado

Escribir una función `saludar(nombre, callback)` que construya un mensaje de saludo y se lo pase al callback para que lo procese.

### Firma esperada

```typescript
function saludar(nombre: string, callback: (mensaje: string) => void) {
  // tu código aquí
}

// Uso esperado
saludar("Ana", console.log);
// Output: "Hola, Ana"
```

### Para reflexionar

- ¿Qué otras funciones podrías pasar como callback además de `console.log`?
- ¿La función `saludar` necesita saber qué hace el callback con el mensaje?

---

## Ejercicio 2 — Operación asincrónica simple

### Objetivo

Ver por primera vez cómo un callback se ejecuta en el futuro, después de que el resto del código ya corrió.

### Enunciado

Escribir una función `esperar(segundos, callback)` que use `setTimeout` para llamar al callback después del tiempo indicado. El callback debe recibir el mensaje `"¡Listo! Esperé X segundos"`, donde `X` es el valor recibido por parámetro.

Luego de llamar a `esperar`, agregar un `console.log("Esto se ejecuta primero")` para observar el orden de ejecución.

### Firma esperada

```typescript
function esperar(segundos: number, callback: (mensaje: string) => void) {
  // tu código aquí
}

// Uso esperado
esperar(2, console.log);
console.log("Esto se ejecuta primero");

// Output esperado:
// "Esto se ejecuta primero"   ← aparece de inmediato
// "¡Listo! Esperé 2 segundos" ← aparece después de 2 segundos
```

### Pistas

- `setTimeout` recibe una función y un tiempo en **milisegundos**: `setTimeout(fn, 2000)` espera 2 segundos.
- El orden del output es parte del ejercicio — prestar atención a qué aparece primero y por qué.

---

## Ejercicio 3 — Error-first callback

### Objetivo

Aprender el patrón de callbacks que usa Node.js en todas sus APIs nativas: el primer parámetro siempre es el error.

### Enunciado

Escribir una función `dividir(a, b, callback)` que:

- Si `b` es `0`, llame al callback con un `new Error("No se puede dividir por cero")` como primer argumento.
- Si no, llame al callback con `null` como primer argumento y el resultado de la división como segundo.

Llamar a la función dos veces: una con una división válida y otra dividiendo por cero, manejando ambos casos.

### Firma esperada

```typescript
function dividir(
  a: number,
  b: number,
  callback: (error: Error | null, resultado?: number) => void
) {
  // tu código aquí
}

// Uso esperado
dividir(10, 2, (error, resultado) => {
  if (error) {
    console.error("Error:", error.message);
    return;
  }
  console.log("Resultado:", resultado); // "Resultado: 5"
});

dividir(10, 0, (error, resultado) => {
  if (error) {
    console.error("Error:", error.message); // "Error: No se puede dividir por cero"
    return;
  }
  console.log("Resultado:", resultado);
});
```

### Pistas

- El patrón error-first significa: si hay error, el primer argumento es el error y el segundo es `undefined`. Si todo salió bien, el primero es `null` y el segundo es el resultado.
- Siempre verificar el error **antes** de usar el resultado.

---

## Ejercicio 4 — Dos callbacks encadenados

### Objetivo

Ver el primer nivel de anidamiento entre callbacks y entender cómo fluyen los datos de uno al siguiente.

### Enunciado

Usando las funciones `esperar` y `dividir` de los ejercicios anteriores, encadenar dos operaciones:

1. Esperar 1 segundo.
2. Dentro del callback de `esperar`, llamar a `dividir(20, 4, ...)` e imprimir el resultado.

### Código esperado

```typescript
esperar(1, (mensaje) => {
  console.log(mensaje); // "¡Listo! Esperé 1 segundos"

  dividir(20, 4, (error, resultado) => {
    if (error) {
      console.error("Error:", error.message);
      return;
    }
    console.log("Resultado de la división:", resultado); // 5
  });
});
```

### Para reflexionar

- ¿Qué pasaría si necesitaras agregar una tercera operación que dependa del resultado de `dividir`?
- ¿Y una cuarta? ¿Cómo quedaría el código visualmente?

---

## Ejercicio 5 — Identificar el problema

### Objetivo

Reflexionar sobre el callback hell antes de ver la solución con Promesas.

### Enunciado

El siguiente código realiza tres operaciones encadenadas usando callbacks. **No hay que modificarlo ni ejecutarlo** — solo leerlo y responder las preguntas debajo.

```typescript
obtenerUsuario(1, (errorUsuario, usuario) => {
  if (errorUsuario) {
    console.error("Error al obtener usuario:", errorUsuario.message);
    return;
  }
  console.log("Usuario:", usuario.nombre);

  obtenerPedidos(usuario.id, (errorPedidos, pedidos) => {
    if (errorPedidos) {
      console.error("Error al obtener pedidos:", errorPedidos.message);
      return;
    }
    console.log("Pedidos:", pedidos.length);

    calcularTotal(pedidos, (errorTotal, total) => {
      if (errorTotal) {
        console.error("Error al calcular total:", errorTotal.message);
        return;
      }
      console.log("Total:", total);
    });
  });
});
```

### Preguntas

1. ¿Qué hace cada nivel de anidamiento? Describir en una línea qué resuelve cada callback.
2. ¿Qué pasa si `obtenerPedidos` falla? ¿Se ejecuta `calcularTotal`?
3. El manejo de errores se repite en cada nivel. ¿Qué problema genera eso a medida que crece el código?
4. ¿Cómo describirías visualmente la forma que toma este código? ¿Por qué se lo llama "Pyramid of Doom"?
5. ¿Qué mecanismo de JavaScript resolverías este problema?

---

## Ejercicio 6 — Mi primera Promesa

### Objetivo

Ver la equivalencia directa entre un callback y una Promesa usando el mismo ejemplo del Ejercicio 2.

### Enunciado

Reescribir la función `esperar` del Ejercicio 2 para que **retorne una Promesa** en lugar de recibir un callback. La promesa debe resolverse con el mensaje `"¡Listo! Esperé X segundos"` después del tiempo indicado.

Consumirla con `.then()` y comparar el resultado con la versión del Ejercicio 2.

### Firma esperada

```typescript
function esperar(segundos: number): Promise<string> {
  return new Promise((resolve) => {
    // tu código aquí
  });
}

// Uso esperado
esperar(2).then(console.log);
console.log("Esto se ejecuta primero");

// Output esperado (igual que el Ejercicio 2):
// "Esto se ejecuta primero"
// "¡Listo! Esperé 2 segundos"
```

### Para reflexionar

- ¿Qué diferencias notás entre la firma de la versión con callback y la versión con Promesa?
- ¿Cuál de las dos te resulta más fácil de leer desde el punto de vista del que llama a la función?

---

## Ejercicio 7 — Resolver y rechazar

### Objetivo

Practicar la creación de una Promesa que puede tanto resolverse con éxito como rechazarse con un error, y consumir ambos casos.

### Enunciado

Escribir una función `verificarEdad(edad)` que retorne una Promesa:

- Si `edad >= 18`, la promesa debe **resolverse** con el mensaje `"Acceso permitido"`.
- Si `edad < 18`, la promesa debe **rechazarse** con el mensaje `"Acceso denegado: debe ser mayor de edad"`.

Llamar a la función dos veces (una con edad válida y otra sin) y manejar ambos casos con `.then()` y `.catch()`.

### Firma esperada

```typescript
function verificarEdad(edad: number): Promise<string> {
  return new Promise((resolve, reject) => {
    // tu código aquí
  });
}

// Uso esperado
verificarEdad(21)
  .then((mensaje) => console.log(mensaje))   // "Acceso permitido"
  .catch((mensaje) => console.error(mensaje));

verificarEdad(15)
  .then((mensaje) => console.log(mensaje))
  .catch((mensaje) => console.error(mensaje)); // "Acceso denegado: debe ser mayor de edad"
```

### Pistas

- `resolve()` es para el caso exitoso — lo que se pase llega al `.then()`.
- `reject()` es para el caso de error — lo que se pase llega al `.catch()`.

---

## Ejercicio 8 — Refactorizar dividir

### Objetivo

Convertir una función con callback al modelo de Promesas y comparar ambas versiones lado a lado.

### Enunciado

Reescribir la función `dividir` del Ejercicio 3 para que **retorne una Promesa** en lugar de usar un callback. El comportamiento debe ser el mismo:

- Si `b` es `0`, la promesa debe rechazarse con un error.
- Si no, la promesa debe resolverse con el resultado.

Consumirla con `.then()` y `.catch()`.

### Firma esperada

```typescript
function dividir(a: number, b: number): Promise<number> {
  return new Promise((resolve, reject) => {
    // tu código aquí
  });
}

// Uso esperado
dividir(10, 2)
  .then((resultado) => console.log("Resultado:", resultado)) // 5
  .catch((error)    => console.error("Error:", error.message));

dividir(10, 0)
  .then((resultado) => console.log("Resultado:", resultado))
  .catch((error)    => console.error("Error:", error.message)); // "No se puede dividir por cero"
```

### Para reflexionar

Poner las dos versiones lado a lado (callback y promesa) y responder:

- ¿En cuál es más clara la separación entre el caso exitoso y el caso de error?
- ¿En cuál es más fácil agregar un paso adicional después de obtener el resultado?

---

## Ejercicio 9 — Encadenar dos Promesas

### Objetivo

Ver cómo el encadenamiento de Promesas reemplaza el anidamiento de callbacks, usando los mismos ejemplos de los ejercicios anteriores.

### Enunciado

Encadenar `esperar` y `dividir` (versiones con Promesas de los Ejercicios 6 y 8) usando `.then()`:

1. Esperar 1 segundo.
2. En el primer `.then()`, imprimir el mensaje de espera y llamar a `dividir(20, 4)` retornando la promesa.
3. En el segundo `.then()`, imprimir el resultado de la división.
4. Agregar un `.catch()` al final que capture cualquier error de cualquier paso.

### Código esperado

```typescript
esperar(1)
  .then((mensaje) => {
    console.log(mensaje);
    return dividir(20, 4); // retornamos la promesa para encadenar
  })
  .then((resultado) => {
    console.log("Resultado:", resultado); // 5
  })
  .catch((error) => {
    console.error("Error en algún paso:", error.message);
  });
```

### Para reflexionar

Comparar este código con el del Ejercicio 4 (callbacks encadenados) y responder:

- ¿Cuál de los dos crece más ordenadamente si agregamos un tercer paso?
- ¿En cuál está más centralizado el manejo de errores?

---

## Ejercicio 10 — Consumir una API

### Objetivo

Aplicar todo lo aprendido sobre Promesas consumiendo una API real con `fetch`.

### Enunciado

Usando `fetch` y encadenamiento de `.then()`, obtener los datos del usuario con ID `1` desde la siguiente URL:

```
GET https://jsonplaceholder.typicode.com/users/1
```

El programa debe:

1. Hacer la petición y parsear la respuesta como JSON en el primer `.then()`.
2. Imprimir el nombre y el email del usuario en el segundo `.then()`, con el formato:
   `"Nombre: [nombre] | Email: [email]"`
3. Manejar cualquier error con `.catch()`, mostrando el mensaje: `"No se pudo obtener el usuario"`.
4. Imprimir `"Consulta finalizada"` con `.finally()`, independientemente del resultado.

### Firma esperada

```typescript
fetch("https://jsonplaceholder.typicode.com/users/1")
  .then(/* parsear JSON */)
  .then(/* imprimir nombre y email */)
  .catch(/* manejar error */)
  .finally(/* mensaje de finalización */);
```

### Estructura de la respuesta

```json
{
  "id": 1,
  "name": "Leanne Graham",
  "email": "Sincere@april.biz"
}
```

### Pistas

- El primer `.then()` debe retornar `respuesta.json()` para que el siguiente `.then()` reciba el objeto ya parseado.
- Para probar el `.catch()`, podés cambiar la URL por una inventada que no exista.

---

## Resumen de ejercicios

| #   | Tema      | Concepto principal                           |
| --- | --------- | -------------------------------------------- |
| 1   | Callbacks | Una función pasada como argumento            |
| 2   | Callbacks | `setTimeout`, ejecución asincrónica          |
| 3   | Callbacks | Patrón error-first                           |
| 4   | Callbacks | Primer nivel de anidamiento                  |
| 5   | Callbacks | Identificar el callback hell                 |
| 6   | Promesas  | `new Promise`, `resolve`, `.then()`          |
| 7   | Promesas  | `resolve` y `reject`, `.then()` y `.catch()` |
| 8   | Promesas  | Refactorizar callback → Promesa              |
| 9   | Promesas  | Encadenamiento con `.then()`                 |
| 10  | Promesas  | `fetch`, `.then()`, `.catch()`, `.finally()` |
