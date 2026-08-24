import Stripe from "stripe";
import { CheckoutLine, CheckoutResult, PaymentProvider } from "../../ports/PaymentProvider";

export class StripePaymentProvider implements PaymentProvider {
  private readonly stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, { apiVersion: "2023-08-16" });
  }

  async createCheckout(lines: CheckoutLine[], baseUrl: string): Promise<CheckoutResult> {
    const session = await this.stripe.checkout.sessions.create({
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel?session_id={CHECKOUT_SESSION_ID}`,
      mode: "payment",
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: line.currency,
          unit_amount: line.priceCents,
          product_data: { name: line.name },
        },
      })),
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return { redirectUrl: session.url, providerRef: session.id };
  }
}
