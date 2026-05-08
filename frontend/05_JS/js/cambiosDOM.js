// ====================================================
// DOM paso a paso: seleccionar, modificar, agregar, borrar
// Cada paso tiene un delay para que se VEA cómo cambia la página.
// ====================================================


// =====================================================
// PASO 1 · SELECCIONAR
// =====================================================
// querySelector busca por selector CSS. Devuelve el PRIMER elemento que matchea.
// Si no encuentra nada, devuelve null.

const titulo = document.querySelector('#titulo');
const descripcion = document.querySelector('#descripcion');
const lista = document.querySelector('#lista');

// querySelectorAll devuelve TODOS los elementos que matchean (NodeList).
const items = document.querySelectorAll('#lista li');


console.log('PASO 1 — SELECCIONAR');
console.log('  título:', titulo);
console.log('  cantidad de items:', items.length);



// =====================================================
// PASO 2 · MODIFICAR (después de 1 segundo)
// =====================================================
// Hay varias formas de modificar un elemento ya seleccionado:
// - .textContent  → cambia el texto
// - .innerHTML    → cambia el contenido HTML
// - .classList    → agrega/quita clases CSS
// - .setAttribute → cambia atributos
// - .style        → cambia estilos directos

titulo.textContent
console.log()

setTimeout(() => {
  console.log('PASO 2 — MODIFICAR');

  // Cambiar el texto del título
  titulo.textContent = 'Título modificado por JS';
  console.log('  texto del título cambiado');

  // Agregar una clase CSS al título
  titulo.classList.add('destacado');
  console.log('  clase "destacado" agregada');

  // Modificar el HTML del párrafo (cuidado: parsea HTML)
  descripcion.innerHTML = 'Texto con <strong>negrita</strong> agregada.';
  console.log('  innerHTML del párrafo cambiado');

  // Modificar todos los items de la lista con un loop
  items.forEach((item, i) => {
    item.textContent = `Item ${i + 1} modificado`;
  });
  console.log('  los 3 items fueron modificados');
}, 1000);



// =====================================================
// PASO 3 · AGREGAR (después de 2 segundos)
// =====================================================
// Agregar un elemento al DOM es siempre 2 pasos:
// 1. document.createElement(tag)  → crea el elemento (todavía no está en la página)
// 2. parent.append(elemento)      → lo inserta dentro de un padre

setTimeout(() => {
  console.log('PASO 3 — AGREGAR');

  // 1. Crear el nuevo <li>
  const nuevo = document.createElement('li');

  // 2. Configurar su contenido y clases
  nuevo.textContent = 'Item agregado por JavaScript';
  nuevo.classList.add('nuevo');

  // 3. Insertarlo al final de la lista
  lista.append(nuevo);
  console.log('  nuevo <li> agregado al final');

  // (alternativas: lista.prepend(nuevo) lo agregaría al principio,
  //  algunItem.before(nuevo) lo agregaría justo antes de otro item, etc.)
}, 2000);



// =====================================================
// PASO 4 · BORRAR (después de 3 segundos)
// =====================================================
// .remove() es la forma moderna y simple: el elemento se autoelimina del DOM.

setTimeout(() => {
  console.log('PASO 4 — BORRAR');

  // Borrar el primer <li> de la lista (selector CSS :first-child)
  const primero = document.querySelector('#lista li:first-child');
  primero.remove();
  console.log('  primer item eliminado');

  // También se puede vaciar todo el contenido de un elemento:
  // lista.replaceChildren();   ← borra todos los hijos
}, 3000);