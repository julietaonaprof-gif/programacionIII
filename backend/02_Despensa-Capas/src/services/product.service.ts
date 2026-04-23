import ProductRepository from "../data/repositories/product.repository";
import CreateProductDto from "../data/dtos/product.dto";
import Product from "../data/models/product";
import CustomError from "../exceptions/custom-error";

export default class ProductService {

  constructor(private repository: ProductRepository) {}

  public async getAllProducts(): Promise<Array<Product>> {
    return await this.repository.findAll();
  }

  public async getProductByName(name: string): Promise<Product> {
    try {
      const product = await this.repository.getProductByName(name);
      if (!product) {
        throw CustomError.buildNotFoundError(`Producto "${name}" no encontrado`, this.constructor.name);
      }
      return product;
    }
    catch(err) {
      if (err instanceof CustomError){
        throw err;
      }
      throw CustomError.buildInternalError(err.message, this.constructor.name, err);
    }
    
  }
  
  public async createProduct(product: CreateProductDto): Promise<Product> {
    try {
      // validar que el nombre del producto sea unico
      const existentProduct = await this.repository.getProductByName(product.name);

      // guardar el producto
      if (existentProduct) {
        throw CustomError.buildConflictError("producto existente", this.constructor.name);
      }

      // devolver el nuevo producto 
      return await this.repository.saveProduct(product);
    }
    catch(err) {
      if (err instanceof CustomError){
        throw err;
      }
      throw CustomError.buildInternalError(err.message, this.constructor.name, err);
    }

  }


}
