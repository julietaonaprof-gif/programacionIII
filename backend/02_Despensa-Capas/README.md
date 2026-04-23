# 🗂️ Sistema de Gestión de Despensa — Arquitectura en Capas

Este proyecto es un ejemplo práctico de cómo estructurar una aplicación backend utilizando una **arquitectura en capas**. El caso de uso elegido es intencionalmente cotidiano: gestionar los productos de la despensa del hogar. Nada como el mundo real (y el miedo a que se venza la harina) para aprender buenas prácticas de diseño. 🥫

---

## 📋 Caso de Uso

Desarrollar una API REST para gestionar los productos de la despensa del hogar. La aplicación permite registrar, consultar, actualizar y eliminar artículos como alimentos, productos de limpieza y otros elementos del hogar.

### Entidades

#### Producto

Representa cada elemento almacenado en la despensa. Posee:

- **nombre** — identificador único del producto.
- **cantidad** — unidades disponibles.
- **fecha de compra** — cuándo ingresó al inventario.
- **fecha de vencimiento** _(opcional)_ — para productos perecederos.
- **categoría** — clasificación del producto.

#### Categoría

Permite agrupar productos bajo un tipo común (por ejemplo: alimentos, limpieza, higiene). Posee un **nombre** y una **descripción**.

### Funcionalidades requeridas

- Visualizar el listado completo de productos en la despensa.
- Ver el detalle de un producto específico.
- Añadir nuevos productos (el nombre no puede repetirse).
- Editar productos existentes, seleccionándolos desde un listado.
- Eliminar productos existentes, seleccionándolos desde un listado.
- Filtrar productos por nombre, categoría o ambos.
- Ver productos próximos a su fecha de vencimiento.

---

## 🗃️ Estructura del Proyecto

```
02_Despensa-Capas/
├── src/
│   ├── app.ts                              # Punto de entrada: configura Express, la base de datos y las rutas
│   ├── controllers/
│   │   └── product.controller.ts           # Capa de presentación: maneja las solicitudes HTTP
│   ├── services/
│   │   └── product.service.ts              # Capa de negocio: contiene la lógica de la aplicación
│   ├── data/
│   │   ├── models/
│   │   │   ├── product.ts                  # Interfaz que representa un producto
│   │   │   └── category.ts                 # Interfaz que representa una categoría
│   │   ├── dtos/
│   │   │   ├── product.dto.ts              # DTO para crear un producto
│   │   │   └── error.dto.ts                # DTO para respuestas de error
│   │   └── repositories/
│   │       └── product.repository.ts       # Capa de datos: consultas a la base de datos
│   └── exceptions/
│       └── custom-error.ts                 # Manejo centralizado de errores
├── dist/                                   # Código JavaScript compilado (generado por tsc)
├── package.json
├── tsconfig.json
└── despensa.db                             # Base de datos SQLite
```

**Stack tecnológico:** TypeScript · Express 5 · SQLite3

---

## 🧱 Las Capas de la Aplicación

La arquitectura en capas divide las responsabilidades del sistema en compartimentos bien definidos. Cada capa tiene un único propósito y solo se comunica con la capa inmediatamente inferior. Esto hace que el código sea más ordenado, más fácil de entender y —lo más importante— más fácil de modificar sin romper todo lo demás.

### 🎮 Controllers (`src/controllers/`)

**Responsabilidad:** ser la puerta de entrada al sistema.

El controller es el primer eslabón de la cadena. Su único trabajo es recibir la solicitud HTTP, extraer los datos que necesita (parámetros, cuerpo, query string), delegarle el trabajo al servicio correspondiente y devolver la respuesta adecuada al cliente.

Lo que **sí** hace un controller:

- Leer parámetros y el cuerpo de la solicitud.
- Llamar al servicio con los datos ya extraídos.
- Transformar el resultado en una respuesta HTTP (código de estado + cuerpo JSON).
- Capturar errores y traducirlos a respuestas de error apropiadas.

Lo que **no** debe hacer un controller:

- Consultar la base de datos directamente.
- Contener reglas de negocio ("el nombre no puede repetirse").

```
GET /products          → listProducts()
GET /productsByName    → getProductByName()
POST /products         → addProduct()
```

### ⚙️ Services (`src/services/`)

**Responsabilidad:** contener toda la lógica de negocio.

El service es el cerebro de la aplicación. Aquí viven las reglas que hacen que el sistema se comporte como se espera: validar que un nombre no esté repetido antes de guardar, lanzar un error si un producto no existe, orquestar múltiples operaciones cuando una acción lo requiere.

Lo que **sí** hace un service:

- Aplicar reglas de negocio.
- Coordinar llamadas al repositorio.
- Lanzar errores de dominio significativos (producto no encontrado, nombre duplicado).

Lo que **no** debe hacer un service:

- Saber nada sobre HTTP (no conoce `Request` ni `Response`).
- Escribir consultas SQL directamente.

El service actúa como intermediario neutral: recibe datos limpios del controller y habla con el repositorio a través de modelos de dominio.

### 🗄️ Data (`src/data/`)

**Responsabilidad:** gestionar el acceso y la persistencia de los datos.

Esta capa agrupa todo lo relacionado con el almacenamiento. Se divide en tres subcarpetas:

| Subcarpeta      | Contenido                      | Función                                                                                            |
| --------------- | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `models/`       | `Product`, `Category`          | Interfaces que representan las entidades del dominio tal como existen en la base de datos          |
| `dtos/`         | `CreateProductDto`, `ErrorDto` | Objetos de transferencia de datos: estructuras que viajan entre capas para operaciones específicas |
| `repositories/` | `ProductRepository`            | Clases que encapsulan todas las consultas SQL                                                      |

El **repositorio** es quien realmente habla con SQLite. Sabe cómo hacer un `SELECT`, un `INSERT` o un `DELETE`, pero no sabe nada de reglas de negocio ni de HTTP. Si mañana se decide cambiar SQLite por PostgreSQL, el único archivo que debería modificarse es el repositorio.

---

## 🧭 Cómo Diseñar Este Tipo de Solución

Diseñar una aplicación en capas puede sentirse abrumador al principio, especialmente si se intenta resolver todo al mismo tiempo. La buena noticia es que existe un orden natural para atacar el problema, y siguiéndolo paso a paso el camino se vuelve mucho más claro.

### Paso 1: Definir las estructuras de datos 🗺️

Antes de escribir una sola línea de código de negocio, hay que saber qué datos se van a manejar. Esto significa responder preguntas como:

- ¿Cuáles son las entidades del sistema?
- ¿Qué atributos tiene cada una?
- ¿Cómo se relacionan entre sí?

En este caso, el análisis condujo a una única tabla principal en la base de datos (`products`), donde la categoría se almacena como un campo de texto simple. Este es un punto de diseño deliberado: no siempre es necesario normalizar al máximo desde el inicio.

```sql
CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT UNIQUE,
  quantity     INTEGER,
  purchaseDate TEXT,
  category     TEXT,
  expDate      TEXT
);
```

Con las tablas definidas, se pueden escribir los **modelos** (`Product`, `Category`) y los **DTOs** necesarios para las operaciones de creación o actualización.

### Paso 2: Definir las capas 🏗️

Una vez que se sabe qué datos se van a manejar, hay que decidir cómo se va a organizar el código. En este proyecto se optó por tres capas:

1. **Controllers** — entrada HTTP.
2. **Services** — lógica de negocio.
3. **Repositories** — acceso a datos.

Esta separación no es caprichosa: cada capa puede ser modificada, testeada y reemplazada de forma independiente.

### Paso 3: Implementar un caso de uso a la vez 🎯

Aquí está el secreto para no volverse loco: **no intentar implementar todo al mismo tiempo**. La estrategia recomendada es tomar el caso de uso más simple, llevarlo hasta el final (desde el repositorio hasta el controller), verificar que funciona, y recién entonces pasar al siguiente.

Por ejemplo, un orden razonable para este proyecto sería:

1. **Listar productos** — el caso más sencillo: sin parámetros, sin validaciones, solo un `SELECT *` y devolver el resultado. Excelente para verificar que todas las capas están bien conectadas.
2. **Obtener producto por nombre** — introduce el manejo de parámetros y la posibilidad de que el recurso no exista (error 404).
3. **Crear producto** — el primer caso con escritura. Incorpora validaciones (nombre único, campos obligatorios) y el uso de DTOs.
4. **Editar producto** — similar a crear, pero requiere verificar que el producto exista antes de modificarlo.
5. **Eliminar producto** — generalmente el más simple de los casos de escritura.
6. **Filtrar por nombre o categoría** — agrega complejidad a la consulta SQL pero no cambia la arquitectura.
7. **Productos próximos a vencer** — puede resolverse como una variante del filtrado con lógica de fechas.

> **El principio detrás de esta estrategia:** es mucho más fácil detectar y corregir errores cuando el cambio que se acaba de hacer es pequeño y acotado. Un caso de uso funcionando al 100% vale más que tres casos de uso a medias.

### Paso 4: Repetir y refactorizar 🔄

A medida que se agregan casos de uso, es natural que emerjan patrones repetidos. Ese es el momento de introducir abstracciones: clases base para el repositorio, middlewares para el manejo de errores, helpers para la validación. Pero nunca antes: la abstracción prematura es uno de los errores más comunes —y más costosos— en el desarrollo de software.
