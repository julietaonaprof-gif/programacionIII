export default interface Product {
  id: number;
  name: string;
  quantity: number;
  purchaseDate: Date;
  category: string;
  expDate?: Date;
}
