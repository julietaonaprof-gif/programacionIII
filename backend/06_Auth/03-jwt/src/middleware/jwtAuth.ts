import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG, JwtPayload } from "../types/jwt.types";

/**
 * Middleware de verificación de JWT (Bearer Token).
 *
 * Flujo:
 * 1. Extrae el token del header "Authorization: Bearer <token>"
 * 2. Verifica la firma y la expiración con jwt.verify()
 * 3. Si es válido, adjunta el payload decodificado a req.user
 * 4. Si no, responde 401
 */
export function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Paso 1: Verificar que existe el header y es de tipo Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Token requerido",
      hint: 'Enviar header: Authorization: Bearer <token>',
    });
    return;
  }

  const token = authHeader.split(" ")[1]; // "Bearer <aquí>"

  // Paso 2: Verificar el token (firma + expiración)
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET)  as unknown as JwtPayload; 

    // Paso 3: Adjuntar el payload al request para uso en los controladores
    req.user = decoded;
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: "Token expirado",
        expiredAt: error.expiredAt,
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Token inválido: " + error.message });
    } else {
      res.status(401).json({ error: "Error al verificar el token" });
    }
  }
}

/**
 * Middleware de autorización por rol.
 * Debe usarse DESPUÉS de verifyToken.
 *
 * @param allowedRoles - Lista de roles que tienen acceso al recurso
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        error: "Acceso denegado",
        message: `Se requiere uno de los roles: ${allowedRoles.join(", ")}`,
        yourRole: user.role,
      });
      return;
    }

    next();
  };
}
