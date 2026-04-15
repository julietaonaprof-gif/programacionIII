import sqlite3 from 'sqlite3';
import { Calificacion } from '../models';

export class CalificacionRepository {
    constructor(private db: sqlite3.Database) {}

    public save(alumno_id: number, nota: number): Promise<Calificacion> {
        return new Promise((resolve, reject) => {
            this.db.run(
                "INSERT INTO calificaciones (alumno_id, nota) VALUES (?, ?)",
                [alumno_id, nota],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, alumno_id, nota });
                }
            );
        });
    }
}
