/**
 * Ejercicio 7 — Resolver y rechazar
 * Escribir una función verificarEdad(edad) que retorne una Promesa que 
 * se resuelva con "Acceso permitido" si la edad es mayor o igual a 18, 
 * o se rechace con "Acceso denegado" si no. 
 * Consumirla con .then() y .catch()
 */ 


function verificarEdad(edad: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (edad < 18) {
      reject(new Error("Acceso denegado"));
      return;
    }
    resolve("Acceso permitido");
  });
}

verificarEdad(1)
  .then((res) => {
    console.log(res)
    return verificarEdad(21);
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err.message));
