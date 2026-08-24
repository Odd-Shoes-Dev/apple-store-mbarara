import { ProductRepository } from "../ports/ProductRepository";
import { CheckoutLine, CheckoutResult, PaymentProvider } from "../ports/PaymentProvider";
import { CartLineInput } from "../domain/types";

export class EmptyCartError extends Error {
  constructor() {
    super("Cart is empty");
  }
}

export class InvalidCartItemError extends Error {
  constructor(productId: string) {
    super(`Product ${productId} is unavailable`);
  }
}

export function createCheckoutService(
  productRepository: ProductRepository,
  paymentProvider: PaymentProvider
) {
  return {
    async createCheckout(cart: CartLineInput[], baseUrl: string): Promise<CheckoutResult> {
      if (!cart || cart.length === 0) {
        throw new EmptyCartError();
      }

      const products = await productRepository.getManyByIds(cart.map((item) => item.productId));
      const productsById = new Map(products.map((product) => [product.id, product]));

      const lines: CheckoutLine[] = cart.map((item) => {
        const product = productsById.get(item.productId);
        if (!product || !product.active) {
          throw new InvalidCartItemError(item.productId);
        }

        return {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          currency: product.currency,
          quantity: item.quantity > 0 ? item.quantity : 1,
        };
      });

      return paymentProvider.createCheckout(lines, baseUrl);
    },
  };
}

export type CheckoutService = ReturnType<typeof createCheckoutService>;
