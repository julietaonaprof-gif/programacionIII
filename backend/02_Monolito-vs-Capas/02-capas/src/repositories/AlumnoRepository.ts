import sqlite3 from 'sqlite3';
import { Alumno } from '../models';

export class AlumnoRepository {
    constructor(private db: sqlite3.Database) {}

    public findAll(): Promise<Alumno[]> {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM alumnos", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows as Alumno[]);
            });
        });
    }

    public findById(id: number): Promise<Alumno | undefined> {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM alumnos WHERE id = ?", [id], (err, row) => {
                if (err) reject(err);
                else resolve(row as Alumno | undefined);
            });
        });
    }

    public save(nombre: string): Promise<Alumno> {
        return new Promise((resolve, reject) => {
            this.db.run("INSERT INTO alumnos (nombre) VALUES (?)", [nombre], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, nombre });
            });
        });
    }
}
