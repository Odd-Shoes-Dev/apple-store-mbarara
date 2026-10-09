export interface ExchangeRateProvider {
  // Returns UGX per 1 USD.
  fetchUsdToUgxRate(): Promise<number>;
}
