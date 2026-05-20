/**
 * Ejercicio 6 — Mi primera Promesa
 * Reescribir la función esperar del Ejercicio 2 para que retorne una Promesa 
 * en lugar de usar un callback. Consumirla con .then(). 
 * El objetivo es ver la equivalencia directa entre callback y promesa con el mismo ejemplo.
 */ 

namespace Promise_01 {

function esperar(segundos: number): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log("Comenzando a ejecutar la función 'esperar'")
    setTimeout(() => {
      resolve(`¡Listo! Esperé ${segundos/1000} segundos`);
    }, segundos);
    console.log("Fin de la función 'esperar'")
  });
}

esperar(1000).then((msg: string) => console.log(msg));

}
