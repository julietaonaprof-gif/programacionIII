// SELECCIONAR el log donde mostraremos los resultados
const log = document.querySelector('#log');


// Función para mostrar una línea con código, resultado y tipo
function mostrar(codigo, resultado) {
  // Limpiar el mensaje inicial si todavía está
  const vacio = log.querySelector('.vacio');
  if (vacio) vacio.remove();

  // FORMATEAR el resultado para que se vea como uno escribiría en el código
  let texto;
  if (typeof resultado === 'string')      texto = `'${resultado}'`;
  else if (typeof resultado === 'bigint') texto = `${resultado}n`;
  else if (typeof resultado === 'symbol') texto = resultado.toString();
  else                                     texto = String(resultado);
  // (esto cubre number, boolean, null, undefined, NaN, Infinity)

  // Construir la línea con HTML para colorearla
  const linea = document.createElement('div');
  linea.className = 'linea';
  linea.innerHTML =
    `<span class="codigo">${codigo}</span>` +
    ` → <span class="resultado">${texto}</span>` +
    ` <span class="tipo">(${typeof resultado})</span>`;

  // Agregar arriba de todo (lo más nuevo primero)
  log.prepend(linea);
}


// EJECUTAR el código de cada botón cuando se le hace clic
document.querySelectorAll('button[data-code]').forEach(boton => {
  boton.addEventListener('click', () => {
    const codigo = boton.dataset.code;

    // eval() ejecuta un string como código JavaScript.
    // Acá lo usamos solo porque es un demo educativo controlado por nosotros.
    // En código real NUNCA hay que usar eval con datos del usuario:
    // es lento y permite ejecutar código arbitrario (riesgo de seguridad).
    const resultado = eval(codigo);

    mostrar(codigo, resultado);
  });
});


// LIMPIAR el log
document.querySelector('#limpiar').addEventListener('click', () => {
  log.replaceChildren();
  const vacio = document.createElement('div');
  vacio.className = 'vacio';
  vacio.textContent = '→ El log aparecerá acá';
  log.append(vacio);
});
