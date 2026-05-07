import express from 'express';

const app = express();
const PORT = 3000;

// Middleware para parsear el body de los requests como JSON
app.use(express.json());

// GET / — endpoint de bienvenida
app.get('/', (_req, res) => {
  res.json({
    mensaje: 'Bienvenido a la API de Libros',
    version: '1.0.0',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
