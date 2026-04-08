const express = require('express');
const app = express();
const port = 3000;

// Middleware para procesar JSON en el cuerpo de las peticiones POST
app.use(express.json());

/**
 * 1. Middleware de Logging
 * Registra el método, la URL, el timestamp y calcula el tiempo de respuesta.
 */
app.use((req, res, next) => {
    const start = Date.now(); // Marca de tiempo inicial
    const timestamp = new Date().toISOString();

    // El evento 'finish' se dispara cuando la respuesta ha sido enviada
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${timestamp}] ${req.method} ${req.url} - ${duration}ms`);
    });

    next(); // Pasa el control a la siguiente función/ruta
});

/**
 * 2. Ruta GET /info
 * Extrae y devuelve metadatos del request.
 */
app.get('/info', (req, res) => {
    const info = {
        metodo: req.method,
        url: req.url,
        headers: req.headers,
        ip: req.ip,
        query_params: req.query
    };
    
    res.json(info);
});

/**
 * 3. Ruta POST /echo
 * Devuelve exactamente lo que recibe en el body.
 */
app.post('/echo', (req, res) => {
    // req.body contiene los datos enviados 
    console.log(JSON.stringify(req.headers));
    console.log(JSON.stringify(req.body));
    res.json(req.body);
});

app.listen(port, () => {
    console.log(`Servidor de eco corriendo en http://localhost:${port}`);
});

