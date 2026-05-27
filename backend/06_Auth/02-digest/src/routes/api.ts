import { Router, Request, Response } from "express";
import { digestAuthMiddleware } from "../middleware/digestAuth";

const router = Router();

// ─── Ruta pública ─────────────────────────────────────────────────────────────

router.get("/public", (_req: Request, res: Response) => {
  res.json({
    message: "Ruta pública: no requiere autenticación",
    timestamp: new Date().toISOString(),
  });
});

// ─── Rutas protegidas ─────────────────────────────────────────────────────────

/**
 * GET /api/protected
 * Requiere autenticación Digest. Retorna info del usuario autenticado.
 */
router.get(
  "/protected",
  digestAuthMiddleware,
  (req: Request, res: Response) => {
    res.json({
      message: "Acceso autorizado vía Digest Authentication",
      user: req.authenticatedUser,
      timestamp: new Date().toISOString(),
    });
  }
);

/**
 * GET /api/profile
 * Requiere autenticación Digest.
 */
router.get(
  "/profile",
  digestAuthMiddleware,
  (req: Request, res: Response) => {
    const user = req.authenticatedUser!;
    res.json({
      message: "Perfil obtenido con Digest Auth",
      profile: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: getPermissionsByRole(user.role),
      },
    });
  }
);

/**
 * GET /api/data
 * Requiere autenticación Digest. Retorna datos protegidos.
 */
router.get(
  "/data",
  digestAuthMiddleware,
  (_req: Request, res: Response) => {
    res.json({
      message: "Datos protegidos obtenidos via Digest Auth",
      data: [
        { id: 1, info: "Registro A", value: 100 },
        { id: 2, info: "Registro B", value: 200 },
        { id: 3, info: "Registro C", value: 300 },
      ],
    });
  }
);

// ─── Helper ───────────────────────────────────────────────────────────────────

function getPermissionsByRole(role: string): string[] {
  const permissions: Record<string, string[]> = {
    admin:  ["read", "write", "delete", "manage_users"],
    editor: ["read", "write"],
    viewer: ["read"],
  };
  return permissions[role] ?? [];
}

export default router;
