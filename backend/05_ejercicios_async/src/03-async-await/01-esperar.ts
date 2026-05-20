/**
 * Ejercicio 1 — Mi primera función async
 * Reescribir la función esperar de los ejercicios anteriores usando async/await. 
 * El objetivo es ver que una función async siempre retorna una Promesa, 
 * y que await pausa la ejecución hasta que la promesa se resuelve.
 */ 

namespace AsyncAwait_Esperar {

function esperar(segundos: number): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log("---- Comenzando a ejecutar la función 'esperar'")
    setTimeout(() => {
      resolve(`¡Listo! Esperé ${segundos/1000} segundos`);
    }, segundos);
    console.log("---- Fin de la función 'esperar'")
  });
}

async function main(): Promise<void> {
  console.log("01 - Comenzando a ejecutar la función 'main'")
  const result = await esperar(2000);
  console.log(`02 - Resultado: ${result}`);
  console.log("03 - Fin ejecución de la función 'main'")
}


// main().then((res) => console.log(`al finalizar main. Res: ${res}`));
main();

}
