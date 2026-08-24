import { Product } from "../server/domain/types";

export function getProductName(product: Product) {
  return product?.name;
}

export function getProductImage(product: Product) {
  return product?.images[0]?.url;
}

export function getProductDescription(product: Product) {
  return product?.description ?? "";
}

export function getProductPrice(product: Product) {
  return product?.priceCents / 100;
}
