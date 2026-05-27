# Autenticación JWT — Node.js + TypeScript + Express

## Instalación y ejecución

```bash
npm install
npm run dev       # desarrollo con ts-node
```

Servidor: `http://localhost:3000`  
Cliente:  abrir `client/index.html` directamente en el navegador (`file://`)

---

## Endpoints

| Método | URL                  | Auth     | Rol requerido | Descripción                 |
|--------|----------------------|----------|---------------|-----------------------------|
| POST   | `/api/auth/login`    | No       | —             | Obtener JWT                 |
| POST   | `/api/auth/logout`   | ✅ JWT   | any           | Cerrar sesión               |
| GET    | `/api/auth/verify`   | ✅ JWT   | any           | Verificar token             |
| GET    | `/api/public`        | No       | —             | Ruta pública                |
| GET    | `/api/protected`     | ✅ JWT   | any           | Recurso genérico protegido  |
| GET    | `/api/profile`       | ✅ JWT   | any           | Perfil del usuario          |
| GET    | `/api/editor`        | ✅ JWT   | admin/editor  | Panel de editor             |
| GET    | `/api/admin`         | ✅ JWT   | admin         | Panel de administración     |

## Usuarios de prueba

| Username | Password   | Rol    |
|----------|------------|--------|
| admin    | admin123   | admin  |
| juan     | juan456    | editor |
| maria    | maria789   | viewer |

---

## Flujo del protocolo (RFC 7519)

```
Cliente                              Servidor
  |                                      |
  |  POST /api/auth/login                |
  |  { username, password }              |
  |------------------------------------->|
  |                                      |
  |  200 OK                              |
  |  { token: "eyJ..." }                 |
  |<-------------------------------------|
  |                                      |
  |  (cliente guarda token en            |
  |   localStorage)                      |
  |                                      |
  |  GET /api/protected                  |
  |  Authorization: Bearer eyJ...        |
  |------------------------------------->|
  |                                      |
  |  (servidor verifica firma + exp)     |
  |                                      |
  |  200 OK  { mensaje, usuario }        |
  |<-------------------------------------|
```

## Estructura del JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Header  (rosa)
.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4ifQ  ← Payload (violeta)
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature (verde)
```

---

## Estructura del proyecto

```
auth-jwt/
├── src/
│   ├── data/users.ts
│   ├── middleware/jwtAuth.ts     ← verifyToken + requireRole
│   ├── routes/api.ts             ← login, logout, rutas por rol
│   ├── types/jwt.types.ts        ← interfaces y config
│   └── index.ts
├── client/
│   └── index.html                ← Login, token display, decoder JWT
├── package.json
└── tsconfig.json
```
