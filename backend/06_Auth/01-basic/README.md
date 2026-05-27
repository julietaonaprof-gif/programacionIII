# Autenticación Basic — Node.js + TypeScript + Express

## Instalación y ejecución

```bash
npm install
npm run dev        # desarrollo con ts-node
# o
npm run build && npm start   # compilar y ejecutar
```

El servidor corre en `http://localhost:3000`.

---

## Endpoints

| Método | URL              | Auth      | Descripción                    |
|--------|------------------|-----------|--------------------------------|
| GET    | `/`              | No        | Info de la API                 |
| GET    | `/api/public`    | No        | Ruta pública de prueba         |
| GET    | `/api/protected` | ✅ Basic  | Recurso protegido              |
| GET    | `/api/profile`   | ✅ Basic  | Perfil del usuario autenticado |
| GET    | `/api/data`      | ✅ Basic  | Datos sensibles simulados      |

---

## Cómo probar con Postman

1. Abrir Postman y crear un nuevo request `GET http://localhost:3000/api/protected`
2. Ir a la pestaña **Authorization**
3. Seleccionar **Type: Basic Auth**
4. Ingresar usuario y contraseña

### Usuarios de prueba

| Username | Password   | Rol    |
|----------|------------|--------|
| admin    | admin123   | admin  |
| juan     | juan456    | editor |
| maria    | maria789   | viewer |

### Qué hace Postman internamente

Toma `usuario:contraseña`, lo codifica en Base64 y envía:
```
Authorization: Basic YWRtaW46YWRtaW4xMjM=
```

---

## Cómo funciona el protocolo

```
Cliente                          Servidor
  |                                  |
  |  GET /api/protected              |
  |--------------------------------->|
  |                                  |
  |  401 Unauthorized                |
  |  WWW-Authenticate: Basic realm=..|
  |<---------------------------------|
  |                                  |
  |  GET /api/protected              |
  |  Authorization: Basic base64(u:p)|
  |--------------------------------->|
  |                                  |
  |  200 OK  /  401 Unauthorized     |
  |<---------------------------------|
```

---

## Estructura del proyecto

```
auth-basic/
├── src/
│   ├── data/
│   │   └── users.ts          ← "Base de datos" en memoria
│   ├── middleware/
│   │   └── basicAuth.ts      ← Middleware de autenticación
│   ├── routes/
│   │   └── api.ts            ← Definición de endpoints
│   └── index.ts              ← Entrada del servidor
├── package.json
└── tsconfig.json
```
