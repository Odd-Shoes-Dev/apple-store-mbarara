import { ProductRepository } from "../ports/ProductRepository";
import {
  NewProductInput,
  Product,
  ProductListFilter,
  ProductPage,
  UpdateProductInput,
} from "../domain/types";

export function createCatalogService(productRepository: ProductRepository) {
  return {
    listActiveProducts(categoryIds?: string[]): Promise<Product[]> {
      return productRepository.list({ active: true, categoryIds });
    },

    listFeaturedProducts(): Promise<Product[]> {
      return productRepository.list({ active: true, featured: true });
    },

    listNewArrivals(): Promise<Product[]> {
      return productRepository.list({ active: true, newArrival: true });
    },

    listAllProducts(filter: ProductListFilter): Promise<Product[]> {
      return productRepository.list(filter);
    },

    async listProductsPage(filter: ProductListFilter, page: number, pageSize: number): Promise<ProductPage> {
      const offset = (page - 1) * pageSize;
      const [products, total] = await Promise.all([
        productRepository.list({ ...filter, limit: pageSize, offset }),
        productRepository.count(filter),
      ]);
      return { products, total, page, pageSize };
    },

    countActiveProducts(categoryIds?: string[]): Promise<number> {
      return productRepository.count({ active: true, categoryIds });
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

    listRelated(productId: string, categoryId: string | null, limit = 4): Promise<Product[]> {
      if (!categoryId) return Promise.resolve([]);
      return productRepository
        .list({ active: true, categoryIds: [categoryId] })
        .then((products) =>
          products.filter((p) => p.id !== productId).slice(0, limit)
        );
    },
  };
}

export type CatalogService = ReturnType<typeof createCatalogService>;
