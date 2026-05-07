export interface Book {
  isbn: string;    // Clave primaria — identificador único del libro en el mundo
  titulo: string;
  autor: string;
  genero: string;
  paginas: number;
}
