# Caso de uso 

Sistema de gestión escolar (simplificado) que debe permitir: 
* registrar Alumnos, 
* cargar sus Calificaciones
* Persistir los datos en una Base de Datos.

# Arquitectura Monolítica

Para ilustrar una Arquitectura Monolítica, vamos a construir una aplicación donde el frontend (HTML/CSS), la lógica de negocio y el acceso a datos (SQLite) conviven en un mismo proyecto y se despliegan como una única unidad.

En este modelo, los módulos de Alumnos y Calificaciones están acoplados: si quieres escalar solo el módulo de Calificaciones, debes duplicar toda la aplicación.

## 📂 Estructura del Proyecto

```

monolito/
├── src/
│   ├── app.ts          <-- Contiene TODA la lógica (Rutas, Negocio, DB)
│   ├── public/
│   │   ├── index.html  <-- Interfaz de usuario
│   │   └── styles.css  <-- Estilos
├── escuela.db          <-- Base de datos SQLite
├── package.json
└── tsconfig.json

```

## 🛠️ Pasos para generar el proyecto

1. En una terminal escribir el comando `npm init` y responder las preguntas que aparecen a continuación.
2. Luego debemos instalar los paquetes necesarios: 

```bash
# instala typescript
npm install typescript --save-dev

# Instala como dependencias express (servidor web) y sqlite3 (bd)
npm i express sqlite3

# Instala dependencias para desarrollo 
npm i -D jest @types/jest @types/sqlite3 @types/express

```

## 🗃️ El código

Primero debemos crear la estructura mostrada anteriormente y luego generar los archivos *index.html* y *app.ts* (el código está a continuación)

```bash

# creamos los directorios
mkdir -p monolito/src/public

# ingresamos al directorio
cd monolito

```

### 📝 app.ts


```typescript
import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

console.log(path.join(__dirname, 'public'));
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
```

### 📝 index.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- <link rel="stylesheet" href="styles.css"> -->
    <title>Gestión Escolar</title>
</head>
<body>
    <h1>Sistema de Gestión Escolar</h1>
    
    <section>
        <h2>Registrar Alumno</h2>
        <input type="text" id="nombreAlumno" placeholder="Nombre completo">
        <button onclick="registrarAlumno()">Guardar</button>
    </section>

    <section>
        <h2>Cargar Calificación</h2>
        <input type="number" id="idAlumno" placeholder="ID del Alumno">
        <input type="number" id="nota" placeholder="Nota (0-10)">
        <button onclick="cargarNota()">Cargar</button>
    </section>

    <script>
        async function registrarAlumno() {
            const nombre = document.getElementById('nombreAlumno').value;
            await fetch('/api/alumnos', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ nombre })
            });
            alert('Alumno registrado');
        }

        async function cargarNota() {
            const alumno_id = document.getElementById('idAlumno').value;
            const nota = document.getElementById('nota').value;
            const response = await fetch('/api/calificaciones', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ alumno_id: parseInt(alumno_id), nota: parseInt(nota) })
            });
            if(response.ok) alert('Nota cargada');
            else alert('Error en los datos');
        }
    </script>
</body>
</html>
```

## 🚀 Ejecutando el monolito

Desde una terminal, ejecutar:

```bash

# compila el proyecto
npm run build

# 🔎 verificar que se haya creado el directorio dist

# ejecutar el proyecto
npm run start

```


**🌐 Luego de esto, desde un navegador, podemos ingresar a `http://localhost:3000`**

----

# 👀 SQLite Viewer

Para poder ver los registros creados en la base de datos podemos utilizar:

* [DB Browser for SQLite (DB4S)](https://sqlitebrowser.org/)
* [SQLite Viewer Web App](https://sqliteviewer.app/)

----

# 🙋 Q&A

1. ¿Por qué se carga automáticamente el html?

Cuando solicitamos esa URL (localhost:3000), sucede lo siguiente:
 - El navegador solicita la raíz / al servidor.
 - Gracias a la línea `app.use(express.static(path.join(__dirname, 'public')))`, Express busca automáticamente un archivo llamado index.html dentro de la carpeta src/public.
 - El servidor envía el HTML al navegador, y este luego solicita los recursos vinculados (css, js, etc).

