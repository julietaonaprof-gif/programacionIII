namespace promises {
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

let nombreAlbum: string;

getUsers()
  .then((usuarios) => {
    const primerUsuario = usuarios[0];
    console.log(`Usuario: ${primerUsuario.name} <${primerUsuario.email}>`);
    return getAlbums(primerUsuario.id);
  })
  .then((albumes) => {
    const primerAlbum = albumes[0];
    nombreAlbum = primerAlbum.title;
    console.log(`Álbum: [${primerAlbum.id}] ${primerAlbum.title}`);
    return getPhotos(primerAlbum.id);
  })
  .then((fotos) => {
    console.log(`\nPrimeras 10 fotos del álbum "${nombreAlbum}":`);
    fotos.forEach((foto: any) => {
      console.log(`  [${foto.id}] ${foto.title}`);
      console.log(`        ${foto.thumbnailUrl}`);
    });
  })
  .catch((err) => console.error("Error:", err.message));

console.log("chau");
}
