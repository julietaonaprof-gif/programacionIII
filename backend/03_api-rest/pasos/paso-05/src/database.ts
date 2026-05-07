import sqlite3 from 'sqlite3';

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
        },
      );
    });
  });
}
