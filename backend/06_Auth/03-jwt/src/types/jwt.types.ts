// ─── Payload del JWT ──────────────────────────────────────────────────────────
// Define qué información almacenamos dentro del token

export interface JwtPayload {
  sub: number;       // Subject: ID del usuario (estándar JWT)
  username: string;  // Username del usuario
  role: string;      // Rol del usuario
  iat?: number;      // Issued At (lo agrega jsonwebtoken automáticamente)
  exp?: number;      // Expiration (lo agrega jsonwebtoken automáticamente)
}

// ─── Configuración del JWT ────────────────────────────────────────────────────

export const JWT_CONFIG = {
  // En producción: usar variable de entorno (process.env.JWT_SECRET)
  // y que sea una cadena larga y aleatoria generada con crypto.randomBytes(64)
  SECRET: "clave_super_secreta_para_ejemplo_programacion_web_2024",

  // Tiempo de expiración del access token
  ACCESS_TOKEN_EXPIRES_IN: "1h" as const,

  // Algoritmo de firma (HS256 = HMAC + SHA-256)
  ALGORITHM: "HS256" as const,
};

// ─── Extensión del tipo Request de Express ───────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
