import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";

const app = express();
app.use(express.json());

// CORS: debe ir ANTES de helmet para que el navegador
// pueda leer la respuesta desde el frontend local
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin ?? "null";
  const allowed = ["http://localhost:5500", "http://127.0.0.1:5500", "null"];
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// ─────────────────────────────────────────────
// HEADERS DE SEGURIDAD
//
// helmet() aplica automáticamente los headers más
// importantes. Luego los configuramos manualmente
// en un endpoint de "inspección" para ver qué
// headers se envían exactamente.
// ─────────────────────────────────────────────

app.use(
  helmet({
    // Strict-Transport-Security: fuerza HTTPS
    hsts: { maxAge: 31536000, includeSubDomains: true },

    // X-Content-Type-Options: nosniff → evita MIME sniffing
    noSniff: true,

    // X-Frame-Options: DENY → evita clickjacking
    frameguard: { action: "deny" },

    // Content-Security-Policy: restringe fuentes de contenido
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },

    // X-XSS-Protection (legacy, pero didáctico)
    xssFilter: true,
  })
);

// Ruta para inspeccionar los headers que el servidor envía
app.get("/api/inspect-headers", (req: Request, res: Response) => {
  // Devuelve los headers de la respuesta para que el cliente los vea
  res.json({
    mensaje: "Inspeccioná los headers de esta respuesta en DevTools (Network tab)",
    // Muestra también los headers del request recibido
    requestHeaders: req.headers,
  });
});

app.listen(3002, () =>
  console.log("Servidor Security Headers en http://localhost:3002")
);
