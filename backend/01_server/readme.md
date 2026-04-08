# 💻 Ejemplo servidor web simple con Expressjs

Implementar un servidor con Express y analizar el request completo
Usá Express.js para crear un servidor que exponga información detallada sobre cada request
recibido.
* Crear una ruta GET /info que devuelva como JSON: método, URL, headers, IP del cliente, query params
* Crear una ruta POST /echo que devuelva el body recibido tal cual
* Crear un middleware que loguee en consola cada request con timestamp y tiempo de respuesta

## 📋 Resumen de la Solución

Para cumplir con el ejercicio, construiremos una aplicación de Node.js utilizando **Express**. La lógica se divide en tres partes:

1.  **Ruta GET `/info`:** Extraeremos las propiedades del objeto `req` (request) que Express nos provee automáticamente.
2.  **Ruta POST `/echo`:** Utilizaremos un middleware integrado para parsear el cuerpo (body) de la petición y devolverlo.
3.  **Middleware de Logging:** Capturaremos el momento en que entra la petición y calcularemos cuánto tarda en procesarse.

---

## 💻 Implementación del Código

Lo primero que debemos realizar es crear un directorio donde guardaremos todos los archivos de nuestro proyecto. Luego, dentro del directorio debemos inicializar el proyecto.

Para inicializar el proyecto e instalar la única dependencia que tiene, en este caso [ExpressJs](https://expressjs.com/), debemos ejecutar los siguientes pasos:

```bash

# Inicializa el proyecto
npm init -y 

# Instala la dependencia
npm install express

```

Luego, debemos crear un archivo llamado `server.js` que contendrá todo el código de nuestra aplicación. El archivo lo puedes encontrar en este mismo repositorio.

---

## 🛠️ Guía de Implementación y Pruebas

### Cómo ejecutarlo
1. Guarda el código en `server.js`.
2. En tu terminal, ejecuta: `node server.js`.

### 🚀 Cómo probar las rutas

Puedes usar **[Postman](https://www.postman.com/)** o estos comandos de **[curl](https://esgeeks.com/como-usar-comando-curl-con-ejemplos/)** en tu terminal:

* **Para probar `/info` con Query Params:**
    ```bash
    curl "http://localhost:3000/info?nombre=Juan&edad=25"
    ```
    *En este caso vemos cómo `req.query` captura automáticamente los parámetros de la URL.*

* **Para probar `/echo` enviando un JSON:**
    ```bash
    curl -X POST http://localhost:3000/echo \
         -H "Content-Type: application/json" \
         -d '{"mensaje": "Hola Mundo", "curso": "Programación Web"}'
    ```
    *En este caso vemos que el servidor responde con el mismo objeto que se envió.*

---

## 💡Conceptos Clave

* **`req.query`**: Express convierte automáticamente los parámetros después del signo `?` en un objeto de JavaScript.
* **`app.use(express.json())`**: Es vital para las peticiones POST. Sin esto, `req.body` será `undefined` porque Node no sabe leer el cuerpo JSON por defecto.
* **Middlewares**: Son funciones que se ejecutan "en el medio" del ciclo de vida de la petición. El middleware de logging que escribimos usa `next()` para permitir que la petición siga su camino hacia la ruta correspondiente.

