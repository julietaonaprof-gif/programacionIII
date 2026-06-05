import express, { Request, Response, NextFunction } from "express";
import Database from "better-sqlite3";

const app = express();
app.use(express.json());

// CORS: permite requests desde el frontend local
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin ?? "null";
  const allowed = ["http://localhost:5500", "http://127.0.0.1:5500", "null"];
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// ─────────────────────────────────────────────
// Base de datos SQLite en memoria (solo para el ejemplo)
// ─────────────────────────────────────────────
const db = new Database(":memory:");

db.exec(`
  CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, email TEXT);
  INSERT INTO users VALUES (1, 'admin', 'admin@example.com');
  INSERT INTO users VALUES (2, 'juan',  'juan@example.com');
`);

// ─────────────────────────────────────────────
// 1. SQL INJECTION
// ─────────────────────────────────────────────

// ❌ VULNERABLE: concatena directamente el input en la query
app.get("/api/users/vulnerable", (req: Request, res: Response) => {
  const username = req.query.username as string;

  // ⚠️ NUNCA hacer esto en producción
  // Payload de ejemplo: ' OR '1'='1  → devuelve todos los usuarios
  const query = `SELECT * FROM users WHERE username = '${username}'`;

  try {
    const rows = db.prepare(query).all();
    res.json({ query, rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message, query });
  }
});

// ✅ SEGURO: usa consulta parametrizada (prepared statement)
app.get("/api/users/seguro", (req: Request, res: Response) => {
  const username = req.query.username as string;

  // El driver escapa automáticamente el valor → no puede romper la query
  const rows = db.prepare("SELECT * FROM users WHERE username = ?").all(username);
  res.json({ rows });
});

// ─────────────────────────────────────────────
// 2. XSS (Script Injection)
// ─────────────────────────────────────────────

// ❌ VULNERABLE: devuelve el input sin escapar dentro de HTML
app.get("/api/greet/vulnerable", (req: Request, res: Response) => {
  const name = req.query.name as string;

  // ⚠️ Si el cliente envía <script>alert('XSS')</script> esto lo inyecta tal cual
  res.send(`<h1>Hola, ${name}!</h1>`);
});

// ✅ SEGURO: escapa los caracteres especiales HTML antes de renderizar
function escapeHtml(text: string): string {
  return text
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#x27;");
}

app.get("/api/greet/seguro", (req: Request, res: Response) => {
  const name = escapeHtml(req.query.name as string ?? "");
  res.send(`<h1>Hola, ${name}!</h1>`);
});

app.listen(3003, () =>
  console.log("Servidor Input Validation en http://localhost:3003")
);
