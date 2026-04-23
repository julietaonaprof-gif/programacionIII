import express from 'express';
import sqlite3 from 'sqlite3';
import ProductRepository from "./data/repositories/product.repository";
import ProductService from "./services/product.service";
import ProductController from "./controllers/product.controller";

const app = express();
const db = new sqlite3.Database('./despensa.db');

app.use(express.json());
// Inicialización de Base de Datos (Módulo DB integrado)
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT unique, quantity integer, purchaseDate TEXT, category TEXT, expDate TEXT)");
});

app.use(express.json());

const prdRepository = new ProductRepository(db);
const prdService = new ProductService(prdRepository);
const prdController = new ProductController(prdService);


app.get("/products", prdController.listProducts);
app.get("/productsByName", prdController.getProductByName);
app.post("/products", prdController.addProduct);

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));

export default app;
