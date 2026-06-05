# Ejemplos de Seguridad en APIs REST
## Programación III – Ing. Alejandro Mostovoi

Cada ejemplo es independiente. Cada uno tiene su propio `backend/` y `frontend/`.

---

## Estructura

```
ejemplos/
├── 1-rate-limiting/     → Rate Limiting y Throttling
├── 2-cors/              → CORS (Cross-Origin Resource Sharing)
├── 3-security-headers/  → Headers de Seguridad (con Helmet)
├── 4-input-validation/  → SQL Injection + XSS (SQLite)
└── 5-rbac/              → Control de Acceso Basado en Roles
```

---

## Cómo correr cada ejemplo

### Prerrequisitos
- Node.js 18+
- `npm install -g ts-node typescript`

### Pasos (igual para todos)

```bash
# 1. Entrar al directorio backend del ejemplo
cd ejemplos/1-rate-limiting/backend

# 2. Instalar dependencias
npm install

# 3. Correr el servidor
npx ts-node server.ts
```

```bash
# 4. Abrir el frontend
# Opción A: Live Server de VS Code → click derecho en index.html → "Open with Live Server"
# Opción B: abrir index.html directamente en el navegador (origen "null")
```

---

## Puertos por ejemplo

| Ejemplo              | Puerto |
|----------------------|--------|
| 1 – Rate Limiting    | 3000   |
| 2 – CORS             | 3001   |
| 3 – Security Headers | 3002   |
| 4 – Input Validation | 3003   |
| 5 – RBAC             | 3004   |

---

## Qué observar en cada ejemplo

### 1. Rate Limiting
- Hacé clic más de 5 veces en 1 minuto → recibís HTTP 429
- Observá el header `RateLimit-Remaining` disminuir en cada request
- El throttle agrega ~300ms de delay deliberado

### 2. CORS
- La ruta `/api/publico` funciona → el servidor envía `Access-Control-Allow-Origin`
- La ruta `/api/bloqueado` falla → abrí DevTools para ver el error de CORS
- Intentá cambiar el puerto del servidor y ver cómo falla la ruta "permitida"

### 3. Security Headers
- Hacé click en "Inspeccionar Headers"
- Abrí **DevTools → Network → Response Headers** para ver la lista completa
- Comparar con y sin `helmet()` comentando la línea `app.use(helmet(...))`

### 4. Input Validation
- **SQL Injection:** en la versión vulnerable probá el payload `' OR '1'='1`
  → devuelve TODOS los usuarios. En la segura, mismo payload → sin resultados.
- **XSS:** en la versión vulnerable probá `<img src=x onerror="alert('XSS')">`
  → ejecuta el script. En la segura, el tag se muestra como texto plano.

### 5. RBAC
- Seleccioná distintos roles y probá los 4 endpoints
- `viewer` solo puede hacer GET → el resto devuelve 403
- `editor` puede GET y POST → DELETE devuelve 403
- `admin` puede todo
- Observá el body de la respuesta 403: informa el rol y permisos actuales

---

## Dependencias por ejemplo

| Ejemplo              | Dependencias clave                          |
|----------------------|---------------------------------------------|
| 1 – Rate Limiting    | `express`, `express-rate-limit`             |
| 2 – CORS             | `express` (CORS manual, sin librería)       |
| 3 – Security Headers | `express`, `helmet`                         |
| 4 – Input Validation | `express`, `better-sqlite3`                 |
| 5 – RBAC             | `express`                                   |
