import { Pool } from "pg";
import { ExchangeRateSettingsRepository } from "../../../ports/ExchangeRateSettingsRepository";
import { ExchangeRateSettings, UpdateExchangeRateSettingsInput } from "../../../domain/types";

type ExchangeRateSettingsRow = {
  mode: ExchangeRateSettings["mode"];
  manual_rate: string | null;
  cached_live_rate: string | null;
  cached_live_rate_fetched_at: Date | null;
};

function mapSettings(row: ExchangeRateSettingsRow): ExchangeRateSettings {
  return {
    mode: row.mode,
    manualRate: row.manual_rate !== null ? Number(row.manual_rate) : null,
    cachedLiveRate: row.cached_live_rate !== null ? Number(row.cached_live_rate) : null,
    cachedLiveRateFetchedAt: row.cached_live_rate_fetched_at,
  };
}

export class PgExchangeRateSettingsRepository implements ExchangeRateSettingsRepository {
  constructor(private readonly db: Pool) {}

  async get(): Promise<ExchangeRateSettings> {
    const result = await this.db.query<ExchangeRateSettingsRow>(
      `SELECT mode, manual_rate, cached_live_rate, cached_live_rate_fetched_at FROM exchange_rate_settings WHERE id = true`
    );
    return mapSettings(result.rows[0]);
  }

  async update(input: UpdateExchangeRateSettingsInput): Promise<ExchangeRateSettings> {
    const sets: string[] = [];
    const params: unknown[] = [];

    if (input.mode !== undefined) {
      params.push(input.mode);
      sets.push(`mode = $${params.length}`);
    }
    if (input.manualRate !== undefined) {
      params.push(input.manualRate);
      sets.push(`manual_rate = $${params.length}`);
    }

    if (sets.length > 0) {
      await this.db.query(`UPDATE exchange_rate_settings SET ${sets.join(", ")} WHERE id = true`, params);
    }

    return this.get();
  }

  async updateCachedLiveRate(rate: number): Promise<void> {
    await this.db.query(
      `UPDATE exchange_rate_settings SET cached_live_rate = $1, cached_live_rate_fetched_at = now() WHERE id = true`,
      [rate]
    );
  }
}
