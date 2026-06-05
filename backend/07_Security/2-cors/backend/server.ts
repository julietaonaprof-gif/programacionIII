import express, { Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());

// ─────────────────────────────────────────────
// CORS - Cross-Origin Resource Sharing
//
// El navegador aplica la Same-Origin Policy:
// bloquea requests a dominios distintos al origen.
// CORS permite relajar esa política de forma controlada.
//
// En este ejemplo implementamos CORS manualmente
// (sin librería) para ver exactamente qué headers se envían.
// ─────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "http://localhost:5500",  // Live Server de VS Code
  "http://127.0.0.1:5500",
  "null",                   // Archivos HTML abiertos directo desde el FS
];

function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin ?? "";

console.log("ejecuta middleware");

  if (ALLOWED_ORIGINS.includes(origin)) {
    // Permite el origen específico (no usar "*" con credenciales)
    res.setHeader("Access-Control-Allow-Origin", origin);
    // Métodos HTTP permitidos
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    // Headers que el cliente puede enviar
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  // Preflight request: el navegador consulta primero si el método está permitido
  if (req.method === "OPTIONS") {
    res.status(204).end(); // No Content — solo confirmamos los permisos
    return;
  }

  next();
}

// app.use(corsMiddleware);

// Ruta pública — cualquier origen puede acceder
app.get("/api/publico", corsMiddleware, (_req: Request, res: Response) => {
  res.json({ mensaje: "Recurso público accesible desde orígenes permitidos" });
});

// Ruta que simula un origen NO permitido para comparar
app.get("/api/bloqueado", (_req: Request, res: Response) => {
  // Este endpoint NO aplica CORS → el navegador bloqueará la respuesta
  // si el origen no está en la lista de permitidos
  res.json({ mensaje: "Este recurso no configura CORS" });
});

app.listen(3001, () =>
  console.log("Servidor CORS en http://localhost:3001")
);
