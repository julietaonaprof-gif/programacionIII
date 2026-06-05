import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());

// CORS: permite requests desde el frontend
// (origen "null" = archivo HTML abierto directo desde el FS)
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
// RATE LIMITING
// Limita la cantidad de requests por IP en una
// ventana de tiempo (fixed window).
// ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,   // Ventana de 1 minuto
  max: 5,                // Máximo 5 requests por IP en esa ventana
  standardHeaders: true, // Envía headers RateLimit-* estándar
  legacyHeaders: false,  // Deshabilita headers X-RateLimit-* legacy
  message: {
    error: "Demasiadas solicitudes. Intentá de nuevo en 1 minuto.",
  },
});

// ─────────────────────────────────────────────
// THROTTLING (simulado con un delay por request)
// Ralentiza el procesamiento cuando hay mucha carga.
// En producción se usaría express-throttle o similar.
// ─────────────────────────────────────────────
const throttleMiddleware = (_req: Request, res: Response, next: Function) => {
  const DELAY_MS = 300; // Agrega 300ms de delay artificial
  setTimeout(next, DELAY_MS);
};

// Endpoint protegido con rate limiting y throttling
app.get(
  "/api/data",
  apiLimiter,
  throttleMiddleware,
  (_req: Request, res: Response) => {
    res.json({
      mensaje: "Respuesta exitosa",
      timestamp: new Date().toISOString(),
    });
  }
);

app.listen(3000, () =>
  console.log("Servidor corriendo en http://localhost:3000")
);
