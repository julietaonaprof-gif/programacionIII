namespace asyncawait {
const BASE_URL = "https://jsonplaceholder.typicode.com";

function getUsers() {
  return fetch(`${BASE_URL}/users`).then((res) => res.json());
}

function getAlbums(userId: number) {
  return fetch(`${BASE_URL}/albums?userId=${userId}`).then((res) => res.json());
}

function getPhotos(albumId: number) {
  return fetch(`${BASE_URL}/photos?albumId=${albumId}&_limit=10`).then((res) => res.json());
}

export async function main() {
  try {
    const usuarios = await getUsers();
    const primerUsuario = usuarios[0];
    console.log(`Usuario: ${primerUsuario.name} <${primerUsuario.email}>`);

    const albumes = await getAlbums(primerUsuario.id);
    const primerAlbum = albumes[0];
    console.log(`Álbum: [${primerAlbum.id}] ${primerAlbum.title}`);

    const fotos = await getPhotos(primerAlbum.id);
    console.log(`\nPrimeras 10 fotos del álbum "${primerAlbum.title}":`);
    fotos.forEach((foto: any) => {
      console.log(`  [${foto.id}] ${foto.title}`);
      console.log(`        ${foto.thumbnailUrl}`);
    });
  } 
  catch (err: any) {
    console.error("Error:", err.message);
  }
  finally() {
    console.log("Ejecución finalizada");
  }
}

}

asyncawait.main();
