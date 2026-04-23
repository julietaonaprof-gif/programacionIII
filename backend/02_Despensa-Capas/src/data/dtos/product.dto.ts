export default interface CreateProductDto {
  name: string;
  quantity: number;
  purchaseDate: Date;
  category: string;
  expDate?: Date;
}

