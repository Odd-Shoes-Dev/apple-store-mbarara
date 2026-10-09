import { ExchangeRateProvider } from "../../ports/ExchangeRateProvider";

export class OpenErApiExchangeRateProvider implements ExchangeRateProvider {
  async fetchUsdToUgxRate(): Promise<number> {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) {
      throw new Error(`Exchange rate API responded with ${res.status}`);
    }

    const data = await res.json();
    const rate = data?.rates?.UGX;

    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
      throw new Error("Exchange rate API did not return a valid UGX rate");
    }

    return rate;
  }
}
