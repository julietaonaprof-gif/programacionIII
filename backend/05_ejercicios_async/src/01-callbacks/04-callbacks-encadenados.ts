/** 
 * Ejercicio 4 — Dos callbacks encadenados
 * Usando las funciones de los ejercicios anteriores, encadenar dos operaciones: 
 * primero esperar 1 segundo, y dentro del callback llamar a dividir. 
 * El objetivo es ver el primer nivel de anidamiento y entender cómo fluyen los datos entre callbacks.
 */


namespace TwoCallbacks {

type callbacType = (err: Error | null, res: number | null) => void

function esperar(segundos: number, callback: (x:string) => void) {
  console.log("Comenzando a ejecutar la función 'esperar'")
  setTimeout(() => {
    callback(`¡Listo! Esperé ${segundos/1000} segundos`);
  }, segundos);
  console.log("Fin de la función 'esperar'")
}

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

esperar(1000, (message: string) => {
  console.log(message);
  dividir(3, 2, imprimir)
});

}
