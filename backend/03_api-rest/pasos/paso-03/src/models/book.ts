export interface Book {
  isbn: string;
  titulo: string;
  autor: string;
  genero: string;
  paginas: number;
}

// Todos los campos son opcionales excepto isbn (que es inmutable)
export type BookPatch = Partial<Omit<Book, 'isbn'>>;
