/**
 * Ejercicio 2 — Operación asincrónica simple
 * Escribir una función esperar(segundos, callback) que use setTimeout 
 * para llamar al callback después del tiempo indicado, pasándole el mensaje
 * "¡Listo! Esperé X segundos". 
 * El objetivo es ver por primera vez cómo un callback se ejecuta en el futuro.
 */

function esperar(segundos: number, callback: (x:string) => void) {
  console.log("Comenzando a ejecutar la función 'esperar'")
  setTimeout(() => {
    callback(`¡Listo! Esperé ${segundos/1000} segundos`);
  }, segundos);
  console.log("Fin de la función 'esperar'")
}

esperar(2000, console.log);
