import { ExchangeRateSettingsRepository } from "../ports/ExchangeRateSettingsRepository";
import { ExchangeRateProvider } from "../ports/ExchangeRateProvider";
import { ExchangeRateSettings, UpdateExchangeRateSettingsInput } from "../domain/types";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export function createExchangeRateService(
  repo: ExchangeRateSettingsRepository,
  provider: ExchangeRateProvider
) {
  return {
    getSettings(): Promise<ExchangeRateSettings> {
      return repo.get();
    },

    // Always fetches fresh — used for the admin's "current live rate" reference display.
    getLiveRate(): Promise<number> {
      return provider.fetchUsdToUgxRate();
    },

    // The rate actually used for customer-facing conversions: manual override if set,
    // otherwise the live rate (cached to avoid hitting the API on every request).
    async getEffectiveRate(): Promise<number> {
      const settings = await repo.get();

      if (settings.mode === "manual" && settings.manualRate) {
        return settings.manualRate;
      }

      const isStale =
        !settings.cachedLiveRateFetchedAt ||
        Date.now() - settings.cachedLiveRateFetchedAt.getTime() > CACHE_TTL_MS;

      if (!isStale && settings.cachedLiveRate) {
        return settings.cachedLiveRate;
      }

      try {
        const rate = await provider.fetchUsdToUgxRate();
        await repo.updateCachedLiveRate(rate);
        return rate;
      } catch {
        if (settings.cachedLiveRate) {
          return settings.cachedLiveRate;
        }
        throw new Error("No exchange rate available");
      }
    },

    updateSettings(input: UpdateExchangeRateSettingsInput): Promise<ExchangeRateSettings> {
      return repo.update(input);
    },
  };
}

export type ExchangeRateService = ReturnType<typeof createExchangeRateService>;
