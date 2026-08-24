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

export function getProductPrice(product: Product): number {
  return product?.priceCents / 100;
}

export function formatPrice(amount: number): string {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "USD";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
