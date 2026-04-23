import { Request, Response } from "express";
import ProductService from "../services/product.service";
import CreateProductDto from "../data/dtos/product.dto";
import ErrorDto from "../data/dtos/error.dto";
import CustomError from "../exceptions/custom-error";

export default class ProductController {

  constructor(private service: ProductService) {
    this.listProducts = this.listProducts.bind(this);
    this.getProductByName = this.getProductByName.bind(this);
    this.addProduct = this.addProduct.bind(this);
  }

  // GET http://localhost:3000/products
  public async listProducts(req: Request, res: Response) {
    const products = await this.service.getAllProducts();
    res.json(products);
  }

  // GET http://localhost:3000/products?name=Lavandina
  public async getProductByName(req: Request, res: Response) {
    try {
      const name = req.query?.["name"];
      if (!name) {
        throw CustomError.buildBadRequestError("El parametro 'name' es obligatorio", this.constructor.name)
      }
      const product = await this.service.getProductByName(name as string);
      res.json(product);
    }
    catch (err) {
      res.status(err.code).json(err.getErrorDto());
    }
  }

  // POST http://localhost:3000/products
  public async addProduct(req: Request, res: Response) {
    try {
      const prodDto = this.getProductDtoFromRequest(req);
      const newProduct = await this.service.createProduct(prodDto);
      res.status(201).json(newProduct);
    }
    catch (err) {
      let error: CustomError = err;
      if (!(err instanceof CustomError)) {
        error = CustomError.buildInternalError("Error Inesperado", "Product", err);
      }
      res.status(error.code).json(error.getErrorDto());
    }
  }

  private getProductDtoFromRequest(request: Request): CreateProductDto {
    const { name, quantity, purchaseDate, category, expDate } = request.body;
    const expiratonDate = expDate ? new Date(expDate) : undefined;
    const dto: CreateProductDto = {
      name,
      quantity,
      purchaseDate: new Date(purchaseDate),
      category,
      expDate: expiratonDate
    }
    return dto;
  }

}
