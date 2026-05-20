/**
 * Ejercicio 9 — Encadenar dos promesas
 * Encadenar esperar y dividir (versiones con Promesas) usando .then(). 
 * Comparar con el Ejercicio 4 y reflexionar sobre la diferencia en legibilidad.
 */ 

namespace Promise_Encadenadas {

function esperar(segundos: number): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log("Comenzando a ejecutar la función 'esperar'")
    setTimeout(() => {
      resolve(`¡Listo! Esperé ${segundos/1000} segundos`);
    }, segundos);
    console.log("Fin de la función 'esperar'")
  });
}

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


esperar(2000)
  .then((res) => {
    console.log(res);
    return dividir(3, 2);
  })
  .then((res) => console.log(`Resultado: ${res}`))
  .catch((err) => console.error(err.message));

}
