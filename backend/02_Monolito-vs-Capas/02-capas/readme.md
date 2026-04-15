# Caso de uso 

Sistema de gestión escolar (simplificado) que debe permitir: 
* registrar Alumnos, 
* cargar sus Calificaciones
* Persistir los datos en una Base de Datos.

**Condición**: plantear una arquitectura en capas


# Arquitectura en capas

En este caso vamos a construir la misma aplicación que se desarrolló en el ejemplo anterior (Monolito), pero en este caso vamos a estructurar la aplicación utilizando una arquitectura en capas.

**Pregunta para la clase...Qué nos falta para poder comenzar el refactor? 🤔** 

> 🙋pssstt...sí, estás en lo correcto...no está faltando tener tests unitarios

En este nuevo ejemplo buscamos:
* desacoplar los módulos de Alumnos y Calificaciones.
* separar responsabilidades: en el monolito no se cumple la regla de adyacencia, donde una capa de nivel K no pueda acceder a la capa de nivel K+2 directamente.

## 📂 Estructura del Proyecto

```
  02-capas/src/
  ├── models/
  │   └── index.ts                  ← Alumno, Calificacion interfaces
  ├── repositories/
  │   ├── AlumnoRepository.ts       ← findAll(), findById(), save()
  │   └── CalificacionRepository.ts ← save()                       
  ├── services/                                                    
  │   ├── AlumnoService.ts          ← registrarNuevoAlumno(), obtenerListado()
  │   └── CalificacionService.ts    ← cargarNota() + reglas de negocio
  ├── controllers/
  │   ├── AlumnoController.ts       ← GET/POST /api/alumnos
  │   └── CalificacionController.ts ← POST /api/calificaciones
  ├── public/
  │   └── index.html                
  └── app.ts                        ← DI + routes

```

### 📊 Capa de acceso a datos (repositories)

> Este es el único lugar donde vive el código que se comunica con la Base de datos (SQLite). Si se decide cambiar SQLite por Postgres SQL, solo se modifica esta capa. (SRP)

```typescript

import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./escuela.db');

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

```

#### Models 

Los models son una representación de las entidades de mi base de datos como objetos

```typescript

export interface Alumno {
    id: number;
    nombre: string;
}

export interface Calificacion {
    id: number;
    alumno_id: number;
    nota: number;
}
```

### 🛠️ Capa de Negocio/Dominio (services)

> En esta capa se deben definir las reglas de negocio. Por ejemplo: "No se puede calificar a un alumno que no existe" o "La nota debe estar entre 0 y 10".

```typescript
import { AlumnoRepository } from '../repositories/AlumnoRepository';
import { Alumno } from '../models';

export class AlumnoService {
    constructor(private alumnoRepository: AlumnoRepository) {}

    public async registrarNuevoAlumno(nombre: string): Promise<Alumno> {
        if (!nombre || nombre.length < 3) throw new Error("Nombre demasiado corto");
        return await this.alumnoRepository.save(nombre);
    }

    public async obtenerListado(): Promise<Alumno[]> {
        return await this.alumnoRepository.findAll();
    }

    public async obtenerPorId(id: number): Promise<Alumno | undefined> {
        return await this.alumnoRepository.findById(id);
    }
}
```

### 🚪Capa de Presentación (controllers)

> La capa de presentación, es la capa que interactúa con el "exterior"; sólo se encarga de recibir la petición HTTP, validar que el formato sea correcto y devolver la respuesta.

```typescript

import { Request, Response } from 'express';
import { AlumnoService } from '../services/AlumnoService';

export class AlumnoController {
    constructor(private alumnoService: AlumnoService) {
        this.getAlumnos = this.getAlumnos.bind(this);
        this.createAlumno = this.createAlumno.bind(this);
    }

    public async getAlumnos(req: Request, res: Response) {
        const alumnos = await this.alumnoService.obtenerListado();
        res.json(alumnos);
    }

    public async createAlumno(req: Request, res: Response) {
        try {
            const { nombre } = req.body;
            const nuevo = await this.alumnoService.registrarNuevoAlumno(nombre);
            res.status(201).json(nuevo);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

```

### El punto de entrada de la app

```typescript

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

```
