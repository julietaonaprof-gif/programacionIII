import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { findUserByCredentials } from "../data/users";
import { verifyToken, requireRole } from "../middleware/jwtAuth";
import { JWT_CONFIG, JwtPayload } from "../types/jwt.types";

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Recibe { username, password } en el body y retorna un JWT si son válidas.
 */
router.post("/auth/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Se requieren username y password" });
    return;
  }

  const user = findUserByCredentials(username, password);

  if (!user) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  // Construir el payload del JWT
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    sub:      user.id,
    username: user.username,
    role:     user.role,
  };

  // Firmar el token
  const token = jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn:  JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    algorithm:  JWT_CONFIG.ALGORITHM,
  });

  // Decodificar para mostrar info educativa sobre el token
  const decoded = jwt.decode(token) as unknown as JwtPayload;

  res.json({
    message:    "Login exitoso",
    token,
    token_info: {
      header:    decodeJwtPart(token.split(".")[0]),
      payload:   decoded,
      expiresAt: new Date((decoded.exp ?? 0) * 1000).toISOString(),
    },
    user: { id: user.id, username: user.username, role: user.role },
  });
});

/**
 * POST /api/auth/logout
 * En JWT stateless, el logout se maneja del lado del cliente (eliminar token).
 * En una implementación real con refresh tokens, aquí se invalidaría el refresh token.
 */
router.post("/auth/logout", verifyToken, (_req: Request, res: Response) => {
  res.json({
    message: "Logout exitoso",
    note:    "El token ya no será válido. El cliente debe eliminarlo del almacenamiento.",
  });
});

/**
 * GET /api/auth/verify
 * Verifica si el token actual es válido y retorna su información.
 */
router.get("/auth/verify", verifyToken, (req: Request, res: Response) => {
  res.json({
    valid:   true,
    message: "Token válido",
    user:    req.user,
  });
});

// ─── Ruta pública ─────────────────────────────────────────────────────────────

router.get("/public", (_req: Request, res: Response) => {
  res.json({
    message: "Ruta pública: no requiere autenticación",
    timestamp: new Date().toISOString(),
  });
});

// ─── Rutas protegidas (cualquier usuario autenticado) ─────────────────────────

/**
 * GET /api/protected
 * Cualquier usuario con token válido puede acceder.
 */
router.get("/protected", verifyToken, (req: Request, res: Response) => {
  res.json({
    message: "Acceso autorizado vía JWT",
    user:    req.user,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/profile
 * Retorna el perfil del usuario autenticado.
 */
router.get("/profile", verifyToken, (req: Request, res: Response) => {
  const user = req.user!;
  res.json({
    message: "Perfil obtenido con JWT",
    profile: {
      id:          user.sub,
      username:    user.username,
      role:        user.role,
      permissions: getPermissionsByRole(user.role),
      tokenInfo: {
        issuedAt:  user.iat ? new Date(user.iat * 1000).toISOString() : null,
        expiresAt: user.exp ? new Date(user.exp * 1000).toISOString() : null,
      },
    },
  });
});

// ─── Rutas protegidas por ROL ─────────────────────────────────────────────────

/**
 * GET /api/admin
 * Solo accesible por usuarios con rol "admin".
 */
router.get(
  "/admin",
  verifyToken,
  requireRole("admin"),
  (req: Request, res: Response) => {
    res.json({
      message: "Panel de administración — acceso exclusivo para admins",
      user: req.user,
      adminData: {
        totalUsers: 3,
        systemStatus: "operativo",
        lastBackup: new Date().toISOString(),
      },
    });
  }
);

/**
 * GET /api/editor
 * Accesible por "admin" y "editor".
 */
router.get(
  "/editor",
  verifyToken,
  requireRole("admin", "editor"),
  (_req: Request, res: Response) => {
    res.json({
      message: "Panel de editor — acceso para admin y editor",
      content: [
        { id: 1, title: "Artículo A", status: "publicado" },
        { id: 2, title: "Artículo B", status: "borrador"  },
      ],
    });
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPermissionsByRole(role: string): string[] {
  const map: Record<string, string[]> = {
    admin:  ["read", "write", "delete", "manage_users"],
    editor: ["read", "write"],
    viewer: ["read"],
  };
  return map[role] ?? [];
}

/** Decodifica una parte del JWT (Base64URL → JSON) para display educativo */
function decodeJwtPart(part: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf-8"));
  } catch {
    return {};
  }
}

export default router;
