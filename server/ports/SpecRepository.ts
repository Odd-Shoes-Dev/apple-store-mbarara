import { ProductSpec } from "../domain/types";

export interface SpecRepository {
  listForProduct(productId: string): Promise<ProductSpec[]>;
  replaceForProduct(productId: string, specs: { label: string; value: string; position: number }[]): Promise<ProductSpec[]>;
}
