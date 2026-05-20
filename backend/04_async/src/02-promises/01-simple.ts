namespace Simple {
const promesa = new Promise((resolve, reject) => {
  const num = Math.random();
  if (num >= 0.5) {
    resolve(`¡La promesa se cumplió! ${num}`);
  } else {
    reject(`La promesa falló. ${num}`);
  }
});

function exito(value: any) {
  console.log(`Resultado de la Promesa: ${value}`);
}

function error(value: any) {
  console.error(`La promesa fue "rechazada" con el error: ${value}`);
}

promesa.then(exito, error);

}


// La promesa fue "rechazada" con el error: La promesa falló. 0.2622449961951878

