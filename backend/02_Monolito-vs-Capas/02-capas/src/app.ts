import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { AlumnoRepository } from './repositories/AlumnoRepository';
import { CalificacionRepository } from './repositories/CalificacionRepository';
import { AlumnoService } from './services/AlumnoService';
import { CalificacionService } from './services/CalificacionService';
import { AlumnoController } from './controllers/AlumnoController';
import { CalificacionController } from './controllers/CalificacionController';

const app = express();
const db = new sqlite3.Database('./escuela.db');

// Inicialización de la Base de Datos
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS alumnos (id INTEGER PRIMARY KEY, nombre TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS calificaciones (id INTEGER PRIMARY KEY, alumno_id INTEGER, nota INTEGER)");
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- ENSAMBLADO DE LA ARQUITECTURA (Inyección de Dependencias) ---

// 1. Capa de Acceso a Datos
const alumnoRepository = new AlumnoRepository(db);
const calificacionRepository = new CalificacionRepository(db);

// 2. Capa de Negocio
const alumnoService = new AlumnoService(alumnoRepository);
const calificacionService = new CalificacionService(calificacionRepository, alumnoRepository);

// 3. Capa de Presentación
const alumnoController = new AlumnoController(alumnoService);
const calificacionController = new CalificacionController(calificacionService);

// --- RUTAS ---
app.get('/api/alumnos', alumnoController.getAlumnos);
app.post('/api/alumnos', alumnoController.createAlumno);
app.post('/api/calificaciones', calificacionController.createNota);

app.listen(3000, () => console.log('Servidor en Capas en http://localhost:3000'));

export default app;
