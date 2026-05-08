/*
  Los métodos clásicos que todavía se ven en código existente son 
  document.getElementById('id') (un poco más rápido para selección por id), 
  document.getElementsByClassName('clase') y 
  document.getElementsByTagName('div')

*/


// SELECCIONAR los elementos que vamos a usar
const entrada = document.querySelector('#entrada');
const boton = document.querySelector('#agregar');
const lista = document.querySelector('#lista');


// Cuando se hace clic en el botón "Agregar"
boton.addEventListener('click', () => {

  // LEER el texto que escribió el usuario
  const texto = entrada.value;
  if (texto === '') return; // si está vacío, no hacemos nada

  // AGREGAR un nuevo <li> a la lista
  const item = document.createElement('li');
  item.textContent = texto;
  lista.append(item);

  // Limpiar el input para la próxima tarea
  entrada.value = '';
});


// BORRAR un <li> cuando se le hace clic
// (escuchamos el clic en la <ul> y vemos qué se clickeó adentro)
lista.addEventListener('click', (evento) => {
  if (evento.target.tagName === 'LI') {
    evento.target.remove();
  }
});
