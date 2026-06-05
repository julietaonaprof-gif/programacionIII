import express, { Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());

// CORS: permite requests desde el frontend local
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin ?? "null";
  const allowed = ["http://localhost:5500", "http://127.0.0.1:5500", "null"];
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-token");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// ─────────────────────────────────────────────
// RBAC – Role-Based Access Control
//
// Tres conceptos clave (según el apunte):
//   Usuario → tiene uno o más Roles
//   Rol     → agrupa un conjunto de Permisos
//   Permiso → acción específica que se puede realizar
// ─────────────────────────────────────────────

// Definición de roles y sus permisos
const ROLES: Record<string, string[]> = {
  admin:  ["read", "write", "delete", "manage_users"],
  editor: ["read", "write"],
  viewer: ["read"],
};

// Usuarios simulados (en producción esto viene de la BD + JWT)
const USERS: Record<string, { role: string }> = {
  token_admin:  { role: "admin" },
  token_editor: { role: "editor" },
  token_viewer: { role: "viewer" },
};

// ─────────────────────────────────────────────
// Middleware: simula verificación de token
// ─────────────────────────────────────────────
function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-token"] as string;
  const user = USERS[token];

  if (!user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  (req as any).user = { token, role: user.role };
  next();
}

// ─────────────────────────────────────────────
// Middleware: verifica si el rol tiene el permiso requerido
// ─────────────────────────────────────────────
function authorize(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role;
    const permissions = ROLES[role] ?? [];

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere permiso: "${requiredPermission}"`,
        tuRol: role,
        tusPermisos: permissions,
      });
    }
    next();
  };
}

// ─────────────────────────────────────────────
// Rutas con distintos niveles de acceso
// ─────────────────────────────────────────────

app.get("/api/articulos",
  authenticate, authorize("read"),
  (_req: Request, res: Response) => {
    res.json({ articulos: ["Artículo 1", "Artículo 2"] });
  }
);

app.post("/api/articulos",
  authenticate, authorize("write"),
  (req: Request, res: Response) => {
    res.json({ mensaje: "Artículo creado", data: req.body });
  }
);

app.delete("/api/articulos/:id",
  authenticate, authorize("delete"),
  (req: Request, res: Response) => {
    res.json({ mensaje: `Artículo ${req.params.id} eliminado` });
  }
);

app.get("/api/admin/usuarios",
  authenticate, authorize("manage_users"),
  (_req: Request, res: Response) => {
    res.json({ usuarios: Object.keys(USERS) });
  }
);

app.listen(3004, () =>
  console.log("Servidor RBAC en http://localhost:3004")
);
