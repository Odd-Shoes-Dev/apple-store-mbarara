import { Currency } from "../server/domain/types";

const CURRENCY_CODES: Record<Currency, string> = {
  ugx: "UGX",
  usd: "USD",
};

export function convertAmount(amount: number, from: Currency, to: Currency, usdToUgxRate: number): number {
  if (from === to) return amount;
  if (from === "usd" && to === "ugx") return amount * usdToUgxRate;
  if (from === "ugx" && to === "usd") return amount / usdToUgxRate;
  return amount;
}

export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY_CODES[currency] }).format(amount);
}
