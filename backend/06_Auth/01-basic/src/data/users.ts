// Simulación de base de datos de usuarios en memoria
// En producción: usar PostgreSQL con contraseñas hasheadas (bcrypt)

export interface User {
  id: number;
  username: string;
  password: string; // En producción: NUNCA almacenar en texto plano
  role: string;
}

export const users: User[] = [
  { id: 1, username: "admin",   password: "admin123",  role: "admin"  },
  { id: 2, username: "juan",    password: "juan456",   role: "editor" },
  { id: 3, username: "maria",   password: "maria789",  role: "viewer" },
];

/**
 * Busca un usuario por username y verifica su contraseña.
 * Retorna el usuario (sin contraseña) si las credenciales son válidas,
 * o null si no lo son.
 */
export function findUserByCredentials(
  username: string,
  password: string
): Omit<User, "password"> | null {
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return null;

  // No exponer la contraseña fuera de esta capa
  const { password: _, ...safeUser } = user;
  return safeUser;
}
