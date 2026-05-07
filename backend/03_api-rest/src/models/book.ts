export interface Book {
  isbn: string;
  titulo: string;
  autor: string;
  genero: string;
  paginas: number;
}

// Para creación (todos los campos son requeridos)
export type BookInput = Book;

// Para actualización parcial (isbn no se puede modificar)
export type BookPatch = Partial<Omit<Book, 'isbn'>>;
