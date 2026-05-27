import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { getPasswordByUsername, findUserByUsername } from "../data/users";

// Extendemos el tipo Request de Express
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: { id: number; username: string; role: string };
    }
  }
}

// ─── Almacén de nonces ────────────────────────────────────────────────────────

interface NonceEntry {
  timestamp: number;  // Para expiración
  usageCount: number; // Para detectar ataques de replay
}

// En producción: usar Redis u otra store distribuida
const nonceStore = new Map<string, NonceEntry>();

const REALM = "api-digest.ejemplo.com";
const NONCE_TTL_MS = 5 * 60 * 1000; // Los nonces expiran en 5 minutos

// ─── Helpers de hash ─────────────────────────────────────────────────────────

/** Calcula MD5 de una cadena y retorna el hex digest */
function md5(data: string): string {
  return crypto.createHash("md5").update(data).digest("hex");
}

/** Genera un nonce seguro y lo almacena en el store */
function generateNonce(): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  nonceStore.set(nonce, { timestamp: Date.now(), usageCount: 0 });
  return nonce;
}

/** Limpia nonces expirados del store (evita memory leaks) */
function cleanExpiredNonces(): void {
  const now = Date.now();
  for (const [nonce, entry] of nonceStore.entries()) {
    if (now - entry.timestamp > NONCE_TTL_MS) {
      nonceStore.delete(nonce);
    }
  }
}

// ─── Parser del header Authorization: Digest ─────────────────────────────────

interface DigestParams {
  username?: string;
  realm?: string;
  nonce?: string;
  uri?: string;
  algorithm?: string;
  response?: string;
  qop?: string;
  nc?: string;
  cnonce?: string;
}

/**
 * Parsea el header "Authorization: Digest username="...", realm="...", ..."
 * y retorna un objeto con los pares clave=valor.
 */
function parseDigestHeader(header: string): DigestParams {
  const params: DigestParams = {};
  // Removemos "Digest " del inicio
  const paramsString = header.substring(7);

  // Expresión regular para capturar: clave="valor" o clave=valor
  const regex = /(\w+)=(?:"([^"]*?)"|([^,\s]+))/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(paramsString)) !== null) {
    const key = match[1] as keyof DigestParams;
    const value = match[2] !== undefined ? match[2] : match[3];
    (params as Record<string, string>)[key] = value;
  }

  return params;
}

// ─── Verificación real del hash según RFC 2617 ────────────────────────────────

/**
 * Recalcula la respuesta esperada según RFC 2617 y la compara
 * con la respuesta enviada por el cliente.
 *
 * Algoritmo:
 *   HA1 = MD5(username:realm:password)
 *   HA2 = MD5(method:uri)
 *   Si qop=auth:  response = MD5(HA1:nonce:nc:cnonce:qop:HA2)
 *   Si no qop:    response = MD5(HA1:nonce:HA2)
 */
function verifyDigestResponse(
  params: DigestParams,
  password: string,
  method: string
): boolean {
  const { username, realm, nonce, uri, response, qop, nc, cnonce } = params;

  // Todos estos campos son obligatorios
  if (!username || !realm || !nonce || !uri || !response) return false;

  // HA1: hash de identidad
  const ha1 = md5(`${username}:${realm}:${password}`);

  // HA2: hash del método y URI
  const ha2 = md5(`${method}:${uri}`);

  // Respuesta esperada según si se usa qop o no
  let expectedResponse: string;

  if (qop === "auth") {
    if (!nc || !cnonce) return false;
    expectedResponse = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
  } else {
    expectedResponse = md5(`${ha1}:${nonce}:${ha2}`);
  }

  // Comparación en tiempo constante para evitar timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(response),
    Buffer.from(expectedResponse)
  );
}

// ─── Middleware principal ─────────────────────────────────────────────────────

/**
 * Middleware de Autenticación Digest (RFC 2617).
 *
 * Flujo:
 * 1. Si no hay header Authorization → enviar desafío 401 con nonce
 * 2. Parsear el header Digest
 * 3. Verificar que el nonce sea válido y no haya expirado
 * 4. Recalcular el hash esperado y comparar con el enviado
 * 5. Si todo es válido → adjuntar usuario y continuar
 */
export function digestAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Limpieza periódica de nonces expirados
  cleanExpiredNonces();

  const authHeader = req.headers.authorization;

  // Paso 1: No hay header → enviar desafío
  if (!authHeader || !authHeader.startsWith("Digest ")) {
    const nonce = generateNonce();
    res.setHeader(
      "WWW-Authenticate",
      `Digest realm="${REALM}", qop="auth", nonce="${nonce}", algorithm=MD5`
    );
    res.status(401).json({
      error: "Autorización requerida",
      hint: "El servidor envió un desafío Digest en el header WWW-Authenticate",
    });
    return;
  }

  // Paso 2: Parsear los parámetros del header Digest
  const params = parseDigestHeader(authHeader);

  if (!params.username || !params.nonce || !params.response) {
    res.status(400).json({ error: "Parámetros Digest incompletos" });
    return;
  }

  // Paso 3: Verificar el nonce
  const nonceEntry = nonceStore.get(params.nonce);
  if (!nonceEntry) {
    // Nonce desconocido o expirado → nuevo desafío con stale=true
    const freshNonce = generateNonce();
    res.setHeader(
      "WWW-Authenticate",
      `Digest realm="${REALM}", qop="auth", nonce="${freshNonce}", algorithm=MD5, stale=true`
    );
    res.status(401).json({ error: "Nonce expirado o inválido. Reintente con el nuevo nonce." });
    return;
  }

  // Incrementar contador de uso del nonce
  nonceEntry.usageCount++;

  // Paso 4: Obtener la contraseña del usuario y verificar el hash
  const password = getPasswordByUsername(params.username);
  if (!password) {
    res.status(401).json({ error: "Usuario no encontrado" });
    return;
  }

  const isValid = verifyDigestResponse(params, password, req.method);
  if (!isValid) {
    res.status(401).json({ error: "Respuesta Digest incorrecta" });
    return;
  }

  // Paso 5: Autenticación exitosa
  const user = findUserByUsername(params.username);
  if (!user) {
    res.status(401).json({ error: "Usuario no encontrado" });
    return;
  }

  req.authenticatedUser = user;
  next();
}
