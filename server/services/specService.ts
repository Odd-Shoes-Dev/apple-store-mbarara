import { SpecRepository } from "../ports/SpecRepository";
import { ProductSpec } from "../domain/types";

export function createSpecService(specRepository: SpecRepository) {
  return {
    listForProduct(productId: string): Promise<ProductSpec[]> {
      return specRepository.listForProduct(productId);
    },

    saveForProduct(
      productId: string,
      specs: { label: string; value: string; position: number }[]
    ): Promise<ProductSpec[]> {
      return specRepository.replaceForProduct(productId, specs);
    },
  };
}

export type SpecService = ReturnType<typeof createSpecService>;
