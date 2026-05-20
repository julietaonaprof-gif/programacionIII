const BASE_URL = "https://jsonplaceholder.typicode.com";

fetch(`${BASE_URL}/users`)
  .then((res) => res.json())
  .then((usuarios) => {
    const primerUsuario = usuarios[0];
    console.log(`Usuario: ${primerUsuario.name} <${primerUsuario.email}>`);

    fetch(`${BASE_URL}/albums?userId=${primerUsuario.id}`)
      .then((res) => res.json())
      .then((albumes) => {
        const primerAlbum = albumes[0];
        console.log(`Álbum: [${primerAlbum.id}] ${primerAlbum.title}`);

        fetch(`${BASE_URL}/photos?albumId=${primerAlbum.id}&_limit=10`)
          .then((res) => res.json())
          .then((fotos) => {
            console.log(`\nPrimeras 10 fotos del álbum "${primerAlbum.title}":`);
            fotos.forEach((foto: any) => {
              console.log(`  [${foto.id}] ${foto.title}`);
              console.log(`        ${foto.thumbnailUrl}`);
            });
          })
          .catch((err) => console.error("Error al obtener fotos:", err.message));
      })
      .catch((err) => console.error("Error al obtener álbumes:", err.message));
  })
  .catch((err) => console.error("Error al obtener usuarios:", err.message));


