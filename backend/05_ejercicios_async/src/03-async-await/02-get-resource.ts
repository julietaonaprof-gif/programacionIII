/**
 * Ejercicio 2 — Obtener un recurso simple
 * Escribir una función async que obtenga el post con ID 1 de 
 * jsonplaceholder.typicode.com/posts/1 e imprima su título y cuerpo. 
 * Manejar errores con try/catch. 
 * El objetivo es escribir la primera llamada a una API externa con async/await.
 */ 

namespace AsyncAwait_GetUserPost {

interface UserPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

async function getUserPost(postId: number): Promise<UserPost> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
  const post = await response.json();
  return post;
}

async function main() {
  const post = await getUserPost(1);
  console.log(`Title: ${post.title}`);
  console.log(`Body ${post.body}`);
}

main();
}
