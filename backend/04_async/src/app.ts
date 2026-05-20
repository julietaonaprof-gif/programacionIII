import fs from "fs";
import path from "path";

console.log("Antes de leer el archivo");

// readFile recibe la ruta, la codificación y un callback
fs.readFile(path.resolve(__dirname, "data/datos.csv"), "utf8", (error, contenido) => {
  // Esta función se ejecuta cuando la lectura termina
  if (error) {
    console.error("Error al leer:", error.message);
    return;
  }
  console.log("Contenido del archivo:", contenido);
});

console.log("Después de llamar a readFile");
