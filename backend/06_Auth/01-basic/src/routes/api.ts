import { Router, Request, Response } from "express";
import { basicAuthMiddleware } from "../middleware/basicAuth";

const router = Router();

// ─── Ruta pública ────────────────────────────────────────────────────────────

/**
 * GET /api/public
 * No requiere autenticación. Útil para verificar que el servidor está activo.
 */
router.get("/public", (_req: Request, res: Response) => {
  res.json({
    message: "Ruta pública: no requiere autenticación",
    timestamp: new Date().toISOString(),
  });
});

// ─── Rutas protegidas ─────────────────────────────────────────────────────────

/**
 * GET /api/protected
 * Requiere autenticación Basic.
 * Retorna información del usuario autenticado.
 */
router.get(
  "/protected",
  basicAuthMiddleware,
  (req: Request, res: Response) => {
    res.json({
      message: "Acceso autorizado a recurso protegido",
      user: req.authenticatedUser,
      timestamp: new Date().toISOString(),
    });
  }
);

/**
 * GET /api/profile
 * Requiere autenticación Basic.
 * Simula la obtención del perfil del usuario autenticado.
 */
router.get(
  "/profile",
  basicAuthMiddleware,
  (req: Request, res: Response) => {
    const user = req.authenticatedUser!;
    res.json({
      message: "Perfil de usuario",
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
 * Requiere autenticación Basic.
 * Simula retorno de datos sensibles.
 */
router.get(
  "/data",
  basicAuthMiddleware,
  (_req: Request, res: Response) => {
    res.json({
      message: "Datos sensibles obtenidos exitosamente",
      data: [
        { id: 1, info: "Registro confidencial A", value: 1000 },
        { id: 2, info: "Registro confidencial B", value: 2500 },
        { id: 3, info: "Registro confidencial C", value: 750  },
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
