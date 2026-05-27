import express, { Application, Request, Response } from "express";
import apiRoutes from "./routes/api";

const app: Application = express();
const PORT = 3000;

// ─── Middleware globales ──────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: permite peticiones desde el cliente HTML (file://)
app.use((req: Request, res: Response, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  // Exponemos el header WWW-Authenticate al cliente JavaScript
  res.setHeader("Access-Control-Expose-Headers", "WWW-Authenticate");

  // Preflight OPTIONS
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

// ─── Rutas ───────────────────────────────────────────────────────────────────

app.use("/api", apiRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "API - Autenticación Digest",
    version: "1.0.0",
    description: "Ejemplo de Digest Authentication (RFC 2617)",
    endpoints: {
      public:    "GET /api/public    → Sin autenticación",
      protected: "GET /api/protected → Requiere Digest Auth",
      profile:   "GET /api/profile   → Requiere Digest Auth",
      data:      "GET /api/data      → Requiere Digest Auth",
    },
    users_for_testing: [
      { username: "admin",  password: "admin123",  role: "admin"  },
      { username: "juan",   password: "juan456",   role: "editor" },
      { username: "maria",  password: "maria789",  role: "viewer" },
    ],
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log("─────────────────────────────────────────────");
  console.log(`  Servidor Digest Auth corriendo en:`);
  console.log(`  http://localhost:${PORT}`);
  console.log("─────────────────────────────────────────────");
  console.log("  Usuarios de prueba:");
  console.log("  admin / admin123  (rol: admin)");
  console.log("  juan  / juan456   (rol: editor)");
  console.log("  maria / maria789  (rol: viewer)");
  console.log("─────────────────────────────────────────────");
});

export default app;
