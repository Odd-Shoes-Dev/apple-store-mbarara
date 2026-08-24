import { ProductRepository } from "../ports/ProductRepository";
import {
  NewProductInput,
  Product,
  ProductListFilter,
  UpdateProductInput,
} from "../domain/types";

export function createCatalogService(productRepository: ProductRepository) {
  return {
    listActiveProducts(category?: Product["category"]): Promise<Product[]> {
      return productRepository.list({ active: true, category });
    },

    listAllProducts(filter: ProductListFilter): Promise<Product[]> {
      return productRepository.list(filter);
    },

    getActiveProductById(id: string): Promise<Product | null> {
      return productRepository.getById(id).then((product) =>
        product && product.active ? product : null
      );
    },

    getProductById(id: string): Promise<Product | null> {
      return productRepository.getById(id);
    },

    createProduct(input: NewProductInput): Promise<Product> {
      return productRepository.create(input);
    },

    updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
      return productRepository.update(id, input);
    },

    archiveProduct(id: string): Promise<void> {
      return productRepository.archive(id);
    },
  };
}

export type CatalogService = ReturnType<typeof createCatalogService>;
