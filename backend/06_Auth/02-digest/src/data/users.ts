// Simulación de base de datos de usuarios en memoria
// En Digest Auth, el servidor necesita conocer la contraseña en texto plano
// (o el hash HA1 pre-calculado) para poder verificar las respuestas del cliente.
// Esta es una de las limitaciones del protocolo Digest.

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

export const users: User[] = [
  { id: 1, username: "admin",  password: "admin123",  role: "admin"  },
  { id: 2, username: "juan",   password: "juan456",   role: "editor" },
  { id: 3, username: "maria",  password: "maria789",  role: "viewer" },
];

/**
 * Retorna la contraseña de un usuario por su username.
 * Necesaria para que el servidor recalcule el hash y verifique la respuesta.
 */
export function getPasswordByUsername(username: string): string | null {
  const user = users.find((u) => u.username === username);
  return user ? user.password : null;
}

/**
 * Busca un usuario por username, sin exponer la contraseña.
 */
export function findUserByUsername(
  username: string
): Omit<User, "password"> | null {
  const user = users.find((u) => u.username === username);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}
