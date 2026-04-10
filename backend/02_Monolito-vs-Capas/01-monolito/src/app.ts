import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const db = new sqlite3.Database('./escuela.db');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicialización de Base de Datos (Módulo DB integrado)
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS alumnos (id INTEGER PRIMARY KEY, nombre TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS calificaciones (id INTEGER PRIMARY KEY, alumno_id INTEGER, nota INTEGER)");
});

// --- MÓDULO DE ALUMNOS ---
app.get('/api/alumnos', (req, res) => {
    // La lógica de negocio y la consulta a la DB están en el mismo sitio
    db.all("SELECT * FROM alumnos", [], (err, rows) => {
        res.json(rows);
    });
});

app.post('/api/alumnos', (req, res) => {
    const { nombre } = req.body;
    db.run("INSERT INTO alumnos (nombre) VALUES (?)", [nombre], function(err) {
        res.json({ id: this.lastID, nombre });
    });
});

// --- MÓDULO DE CALIFICACIONES ---
app.post('/api/calificaciones', (req, res) => {
    const { alumno_id, nota } = req.body;
    // Validación simple de negocio mezclada con la persistencia
    if (nota < 0 || nota > 10) return res.status(400).send("Nota inválida");

    db.run("INSERT INTO calificaciones (alumno_id, nota) VALUES (?, ?)", [alumno_id, nota], function(err) {
        res.json({ id: this.lastID, alumno_id, nota });
    });
});

app.listen(3000, () => console.log('Servidor Monolítico en http://localhost:3000'));
