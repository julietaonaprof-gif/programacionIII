namespace PromisesAndLoops {
const BASE_URL = "https://jsonplaceholder.typicode.com";

function getUsers() {
  return fetch(`${BASE_URL}/users`).then((res) => res.json());
}

function getAlbums(userId: number) {
  return fetch(`${BASE_URL}/albums?userId=${userId}`).then((res) => res.json());
}

// ============================================================
// forEach — el await es ignorado por forEach.
// Los requests se lanzan todos a la vez sin orden garantizado,
// y la función termina antes de que completen.
// ============================================================
async function withForEach() {
  console.log("=== forEach ===");

  const usuarios = await getUsers();

  usuarios.slice(0, 3).forEach(async (usuario: any) => {
    const albumes = await getAlbums(usuario.id);
    console.log(`[forEach] ${usuario.name} -> álbum: "${albumes[0].title}"`);
  });

  console.log("[forEach] Fin de withForEach (puede aparecer antes que los resultados)");
}

// ============================================================
// for...of — el await es respetado en cada iteración.
// Los requests se ejecutan uno por uno en orden.
// ============================================================
async function withForOf() {
  console.log("\n=== for...of ===");

  const usuarios = await getUsers();

  for (const usuario of usuarios.slice(0, 3)) {
    const albumes = await getAlbums(usuario.id);
    console.log(`[for...of] ${usuario.name} -> álbum: "${albumes[0].title}"`);
  }

  console.log("[for...of] Fin de withForOf (aparece después de todos los resultados)");
}

export async function main() {
  await withForEach();
  await withForOf();
}
}

PromisesAndLoops.main().catch((err) => console.error("Error:", err.message));
