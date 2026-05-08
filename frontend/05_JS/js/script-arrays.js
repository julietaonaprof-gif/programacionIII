// CREAR un array
let numeros = [1, 2, 3, 4, 5];

// Elementos del DOM
const display = document.querySelector('#display');
const log = document.querySelector('#log');
const entrada = document.querySelector('#entrada');

// Función para mostrar el array en pantalla
function mostrar() {
  display.innerHTML = ''; //Vaciamos el contenedor antes de mostrar el array actualizado
  numeros.forEach(n => {
    const item = document.createElement('span'); // Creamos un nuevo elemento para cada número
    item.className = 'item'; // Le damos una clase para estilos
    item.textContent = n; // Le asignamos el número como texto 
    display.append(item); // Lo agregamos al contenedor del display
  });
}

function logear(accion) {
  log.textContent = accion + '  →  [' + numeros.join(', ') + ']';
}

mostrar();


// AGREGAR al final con push (modifica el array original)
document.querySelector('#push').addEventListener('click', () => {
  const valor = Number(entrada.value);
  numeros.push(valor);
  mostrar();
  logear(`push(${valor})`);
});

// AGREGAR al principio con unshift (modifica el array original)
document.querySelector('#unshift').addEventListener('click', () => {
  const valor = Number(entrada.value);
  numeros.unshift(valor);
  mostrar();
  logear(`unshift(${valor})`);
});

// QUITAR el último con pop (modifica el array y devuelve el quitado)
document.querySelector('#pop').addEventListener('click', () => {
  const quitado = numeros.pop();
  mostrar();
  logear(`pop() devolvió ${quitado}`);
});

// QUITAR el primero con shift (modifica el array y devuelve el quitado)
document.querySelector('#shift').addEventListener('click', () => {
  const quitado = numeros.shift();
  mostrar();
  logear(`shift() devolvió ${quitado}`);
});


// MAP: aplica una función a cada elemento y devuelve un array NUEVO
document.querySelector('#map').addEventListener('click', () => {
  numeros = numeros.map(n => n * 2);
  mostrar();
  logear('map(n => n * 2)');
});

// FILTER: devuelve un array NUEVO con los que cumplen la condición
document.querySelector('#filter').addEventListener('click', () => {
  numeros = numeros.filter(n => n % 2 === 0);
  mostrar();
  logear('filter(n => n % 2 === 0)');
});

// FIND: devuelve el PRIMER elemento que cumple la condición (no muta)
document.querySelector('#find').addEventListener('click', () => {
  const encontrado = numeros.find(n => n > 3);
  logear(`find(n => n > 3) devolvió ${encontrado}`);
});


// SORT: ordena el array (modifica el original)
document.querySelector('#sort').addEventListener('click', () => {
  numeros.sort((a, b) => a - b);
  mostrar();
  logear('sort((a, b) => a - b)');
});

// REVERSE: invierte el orden (modifica el original)
document.querySelector('#reverse').addEventListener('click', () => {
  numeros.reverse();
  mostrar();
  logear('reverse()');
});


// Resetear el array a su estado inicial
document.querySelector('#reset').addEventListener('click', () => {
  numeros = [1, 2, 3, 4, 5];
  mostrar();
  logear('reset');
});
