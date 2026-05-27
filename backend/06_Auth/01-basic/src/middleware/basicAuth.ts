import { Request, Response, NextFunction } from "express";
import { findUserByCredentials } from "../data/users";

// Extendemos el tipo Request de Express para adjuntar el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: { id: number; username: string; role: string };
    }
  }
}

/**
 * Middleware de Autenticación Basic (RFC 7617).
 *
 * Flujo:
 * 1. Verifica que exista el header "Authorization: Basic <base64>"
 * 2. Decodifica el Base64 → "usuario:contraseña"
 * 3. Busca el usuario en la base de datos
 * 4. Si es válido, adjunta el usuario a req y llama a next()
 * 5. Si no, responde 401 con el header WWW-Authenticate
 */
export function basicAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Paso 1: Verificar que existe el header y que es de tipo Basic
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="api.ejemplo.com"');
    res.status(401).json({
      error: "Autorización requerida",
      hint: 'Enviar header: Authorization: Basic <base64(usuario:contraseña)>',
    });
    return;
  }

  // Paso 2: Decodificar las credenciales desde Base64
  const base64Credentials = authHeader.split(" ")[1]; // "Basic <aquí>"
  const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");

  // El formato esperado es "usuario:contraseña"
  // Usamos indexOf para manejar contraseñas que contengan ":"
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    res.status(400).json({ error: "Formato de credenciales inválido" });
    return;
  }

  const username = decoded.substring(0, separatorIndex);
  const password = decoded.substring(separatorIndex + 1);

  // Paso 3: Verificar contra la base de datos
  const user = findUserByCredentials(username, password);

  if (!user) {
    res.setHeader("WWW-Authenticate", 'Basic realm="api.ejemplo.com"');
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  // Paso 4: Adjuntar usuario autenticado a la request para uso posterior
  req.authenticatedUser = user;
  next();
}
