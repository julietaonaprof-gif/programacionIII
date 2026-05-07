import sqlite3 from 'sqlite3';

/**
 * Crea y/o abre la base de datos SQLite y garantiza que la tabla `books`
 * exista. Devuelve una Promise<Database> para poder usar await en app.ts.
 *
 * @param filename  Ruta al archivo .db. Usar ':memory:' en tests.
 */
export function initDatabase(filename = './books.db'): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filename, (connErr) => {
      if (connErr) return reject(connErr);
    });

    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS books (
          isbn    TEXT    PRIMARY KEY,
          titulo  TEXT    NOT NULL,
          autor   TEXT    NOT NULL,
          genero  TEXT    NOT NULL,
          paginas INTEGER NOT NULL
        )`,
        (err) => {
          if (err) return reject(err);
          resolve(db);
        }
      );
    });
  });
}
