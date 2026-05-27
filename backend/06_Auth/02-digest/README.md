# Autenticación Digest — Node.js + TypeScript + Express

## Instalación y ejecución

```bash
npm install
npm run dev       # desarrollo con ts-node
```

Servidor: `http://localhost:3000`  
Cliente:  abrir `client/index.html` directamente en el navegador (`file://`)

---

## Endpoints

| Método | URL              | Auth       | Descripción          |
|--------|------------------|------------|----------------------|
| GET    | `/api/public`    | No         | Ruta pública         |
| GET    | `/api/protected` | ✅ Digest  | Recurso protegido    |
| GET    | `/api/profile`   | ✅ Digest  | Perfil del usuario   |
| GET    | `/api/data`      | ✅ Digest  | Datos protegidos     |

## Usuarios de prueba

| Username | Password   | Rol    |
|----------|------------|--------|
| admin    | admin123   | admin  |
| juan     | juan456    | editor |
| maria    | maria789   | viewer |

---

## Flujo del protocolo (RFC 2617)

```
Cliente                              Servidor
  |                                      |
  |  GET /api/protected                  |
  |------------------------------------->|
  |                                      |
  |  401 Unauthorized                    |
  |  WWW-Authenticate: Digest            |
  |    realm="...", nonce="abc123",      |
  |    qop="auth", algorithm=MD5         |
  |<-------------------------------------|
  |                                      |
  |  (cliente calcula hashes)            |
  |  HA1 = MD5(user:realm:pass)          |
  |  HA2 = MD5(method:uri)               |
  |  resp = MD5(HA1:nonce:nc:cnonce:     |
  |              qop:HA2)                |
  |                                      |
  |  GET /api/protected                  |
  |  Authorization: Digest               |
  |    username="...", response="..."    |
  |------------------------------------->|
  |                                      |
  |  (servidor recalcula y compara)      |
  |                                      |
  |  200 OK                              |
  |<-------------------------------------|
```

---

## Estructura del proyecto

```
auth-digest/
├── src/
│   ├── data/users.ts
│   ├── middleware/digestAuth.ts   ← Verificación real con MD5
│   ├── routes/api.ts
│   └── index.ts
├── client/
│   └── index.html                ← Cliente web con MD5 en JS puro
├── package.json
└── tsconfig.json
```
