import sqlite3 from "sqlite3";
import Product from "../models/product";
import CreateProductDto from "../dtos/product.dto";
import CustomError from "../../exceptions/custom-error";

export default class ProductRepository {

  constructor(private db: sqlite3.Database) { }

  public findAll(): Promise<Array<Product>> {
    return new Promise((resolve, reject) => {
      this.db.all<Product>("select * from products", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      })
    });
  }

  public getProductByName(productName: string): Promise<Product> {
    if (!productName) {
      throw CustomError.buildBadRequestError("El nombre del producto es obligatorio", this.constructor.name);
    }
    return new Promise((resolve, reject) => {
      this.db.get<Product>("select * from products where name = ?", [productName], (err, rows) => {
        if (err){
           reject(err);
        }
        else {
          resolve(rows);
        }
      })
    });
  }

  public saveProduct(product: CreateProductDto): Promise<Product> {

    this.validate(product);

    return new Promise((resolve, reject) => {
      const expDate = product.expDate?.toISOString() ?? "";
      this.db.run("insert into products (name, quantity, purchaseDate, category, expDate) values(?, ?, ?, ?, ?)",
        [product.name, product.quantity, product.purchaseDate.toISOString(), product.category, expDate],
        function (err) {
          if (err) {
            reject(err);
          }
          else {
            resolve({
              id: this.lastID,
              name: product.name,
              quantity: product.quantity,
              purchaseDate: product.purchaseDate,
              category: product.category,
              expDate: product.expDate
            });
          }
        })
    });
  }

  private validate(product: CreateProductDto): void {
    if (!product.name) {
      throw CustomError.buildBadRequestError("El nombre del producto es obligatorio", this.constructor.name);
    }
    if (!product.quantity){
      throw CustomError.buildBadRequestError("La cantidad del producto es obligatoria", this.constructor.name);
    }
    if (Number.isNaN(Number(product.quantity))) {
      throw CustomError.buildBadRequestError("La cantidad del producto debe ser un valor numerico", this.constructor.name);
    }
    if (!product.category) {
      throw CustomError.buildBadRequestError("La categoria del producto es obligatoria", this.constructor.name);
    }
  }
}
