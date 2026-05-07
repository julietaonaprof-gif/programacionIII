export interface Book {
  isbn: string;
  titulo: string;
  autor: string;
  genero: string;
  paginas: number;
}

export type BookInput = Book;
export type BookPatch = Partial<Omit<Book, 'isbn'>>;
