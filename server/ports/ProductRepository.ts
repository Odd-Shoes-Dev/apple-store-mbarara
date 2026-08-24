import {
  NewProductInput,
  Product,
  ProductListFilter,
  UpdateProductInput,
} from "../domain/types";

export interface ProductRepository {
  list(filter: ProductListFilter): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getManyByIds(ids: string[]): Promise<Product[]>;
  create(input: NewProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  archive(id: string): Promise<void>;
}
