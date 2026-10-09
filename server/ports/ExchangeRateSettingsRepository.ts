import { ExchangeRateSettings, UpdateExchangeRateSettingsInput } from "../domain/types";

export interface ExchangeRateSettingsRepository {
  get(): Promise<ExchangeRateSettings>;
  update(input: UpdateExchangeRateSettingsInput): Promise<ExchangeRateSettings>;
  updateCachedLiveRate(rate: number): Promise<void>;
}
