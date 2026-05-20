import fs from "fs";
import path from "path";

function convertirArchivo(origen: string, destino: string, callback) {
  fs.readFile(path.resolve(__dirname, "data/datos.csv"), "utf8", (error, contenido) => {
    if (error) {
      console.error("Error al leer:", error.message);
      callback(error);
      return;
    }
  
    const lines = String(contenido).split("\n").map((line) => line.toUpperCase());
    fs.writeFile(path.resolve(__dirname, "data/datos_conv.csv"), lines.join("\n"), "utf8", (err) => {
      if (err) {
        console.error(`Error al escribir archivo. Detalle: ${err}`);
      }
      console.info("Archivo convertido con exito");
    })
  });
}

