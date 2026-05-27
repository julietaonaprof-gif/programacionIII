// Simulación de base de datos de usuarios en memoria
// En producción: usar PostgreSQL con contraseñas hasheadas (bcrypt)

export interface User {
  id: number;
  username: string;
  password: string; // En producción: NUNCA texto plano — usar bcrypt
  role: string;
  email: string;
}

export const users: User[] = [
  { id: 1, username: "admin",  password: "admin123",  role: "admin",  email: "admin@ejemplo.com"  },
  { id: 2, username: "juan",   password: "juan456",   role: "editor", email: "juan@ejemplo.com"   },
  { id: 3, username: "maria",  password: "maria789",  role: "viewer", email: "maria@ejemplo.com"  },
];

/**
 * Busca un usuario por username y contraseña.
 * Retorna el usuario sin contraseña, o null si las credenciales son inválidas.
 */
export function findUserByCredentials(
  username: string,
  password: string
): Omit<User, "password"> | null {
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;

  const { password: _, ...safeUser } = user;
  return safeUser;
}

/**
 * Busca un usuario por ID (para el middleware de verificación de token).
 */
export function findUserById(
  id: number
): Omit<User, "password"> | null {
  const user = users.find((u) => u.id === id);
  if (!user) return null;

  const { password: _, ...safeUser } = user;
  return safeUser;
}
