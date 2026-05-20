/**
 * Ejercicio 10 — Consumir una API
 * Usando fetch y .then(), obtener el usuario con ID 1 de 
 * 'https://jsonplaceholder.typicode.com/users/1' e imprimir su nombre y email. 
 * Manejar errores con .catch() y agregar un mensaje de finalización con .finally().
 */ 


fetch('https://jsonplaceholder.typicode.com/users/1')
  .then((res) => {
    return res.json();
  })
  .then((data) => console.log(`Usuario: ${data.name} - email ${data.email}`))
  .catch((err) => console.error(`Error: ${err.message}`))
  .finally(() => console.info("Operación finalizada!"));
