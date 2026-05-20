/**
 * Ejercicio 3 — Error-first callback
 * Escribir una función dividir(a, b, callback) que siga el patrón error-first: 
 * si b es cero llama al callback con un error, si no con el resultado. 
 * El objetivo es aprender el patrón de Node.js antes de tocar el sistema de archivos.
 */

type callbacType = (err: Error | null, res: number | null) => void

function dividir(dividendo: number, divisor: number, callback: callbacType ): void {
  if (divisor === 0) {
    const error = new Error("El divisor no puede ser 0");
    callback(error, null);
    return;
  }
  callback(null, dividendo/divisor);
}

function imprimir(err: Error | null, res: number | null): void {
  if (err) {
    console.error(`Error: ${err.message}`);
    return;
  }
  console.log(`Resultado: ${res}`);
}

console.log("############LLama con Resultado##################");
dividir(4, 2, imprimir);
console.log("##############################");
console.log("");
console.log("############LLama con Error##################");
dividir(4, 0, imprimir);
console.log("##############################");
