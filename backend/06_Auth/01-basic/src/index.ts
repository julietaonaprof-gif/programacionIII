import express, { Application, Request, Response } from "express";
import apiRoutes from "./routes/api";

const app: Application = express();
const PORT = 3000;

// ─── Middleware globales ──────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rutas ───────────────────────────────────────────────────────────────────

app.use("/api", apiRoutes);

// Ruta raíz informativa
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "API - Autenticación Basic",
    version: "1.0.0",
    description: "Ejemplo de Basic Authentication (RFC 7617)",
    endpoints: {
      public:    "GET /api/public    → Sin autenticación",
      protected: "GET /api/protected → Requiere Basic Auth",
      profile:   "GET /api/profile   → Requiere Basic Auth",
      data:      "GET /api/data      → Requiere Basic Auth",
    },
    users_for_testing: [
      { username: "admin",  password: "admin123",  role: "admin"  },
      { username: "juan",   password: "juan456",   role: "editor" },
      { username: "maria",  password: "maria789",  role: "viewer" },
    ],
    postman_tip:
      'En Postman: Tab "Authorization" → Type "Basic Auth" → ingresar usuario y contraseña',
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log("─────────────────────────────────────────────");
  console.log(`  Servidor Basic Auth corriendo en:`);
  console.log(`  http://localhost:${PORT}`);
  console.log("─────────────────────────────────────────────");
  console.log("  Endpoints disponibles:");
  console.log(`  GET http://localhost:${PORT}/api/public`);
  console.log(`  GET http://localhost:${PORT}/api/protected  ← Basic Auth`);
  console.log(`  GET http://localhost:${PORT}/api/profile    ← Basic Auth`);
  console.log(`  GET http://localhost:${PORT}/api/data       ← Basic Auth`);
  console.log("─────────────────────────────────────────────");
  console.log("  Usuarios de prueba:");
  console.log("  admin / admin123  (rol: admin)");
  console.log("  juan  / juan456   (rol: editor)");
  console.log("  maria / maria789  (rol: viewer)");
  console.log("─────────────────────────────────────────────");
});

export default app;
