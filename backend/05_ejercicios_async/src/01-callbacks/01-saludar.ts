/**
 * Ejercicio 1 — Mi primer callback
 * Escribir una función saludar(nombre, callback) que llame al 
 * callback pasándole un mensaje de saludo. 
 * Luego llamarla pasando una función que imprima el mensaje por consola. 
 * El objetivo es entender que un callback es simplemente una función que se pasa como argumento.
 */
function saludar(name:string, callback:(t:string) => void) {
  callback(`Hola ${name}`);
}

saludar("ale", console.log);
