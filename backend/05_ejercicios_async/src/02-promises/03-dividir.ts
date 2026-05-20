/**
 * Ejercicio 8 — Refactorizar dividir
 * Reescribir la función dividir del Ejercicio 3 para que retorne una Promesa. 
 * Consumirla con .then() y .catch(), y comparar con la versión de callback.
 */ 

namespace Promise_Dividir {

function dividir(dividendo: number, divisor: number): Promise<number> {
  return new Promise((resolve, reject) => {
    if (divisor === 0) {
      const error = new Error("El divisor no puede ser 0");
      reject(error);
      return;
    }
    resolve(dividendo/divisor);
  });
}


dividir(3, 0)
  .then((res) => console.log(`Resultado: ${res}`))
  .catch((err) => console.error(err.message));
}
