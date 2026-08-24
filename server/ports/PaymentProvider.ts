export type CheckoutLine = {
  productId: string;
  name: string;
  priceCents: number;
  currency: string;
  quantity: number;
};

export type CheckoutResult = {
  redirectUrl: string;
  providerRef: string;
};

export interface PaymentProvider {
  createCheckout(lines: CheckoutLine[], baseUrl: string): Promise<CheckoutResult>;
}
