-- 013_currency.sql

-- Every existing product was always displayed as UGX (the old site-wide
-- NEXT_PUBLIC_CURRENCY env var), even though this column said 'usd' —
-- that value was written on create but never actually read anywhere.
-- Backfill to match what was really shown, then make the column honest.
UPDATE products SET currency = 'ugx' WHERE currency = 'usd';

ALTER TABLE products ALTER COLUMN currency SET DEFAULT 'ugx';

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_currency_check;
ALTER TABLE products ADD CONSTRAINT products_currency_check CHECK (currency IN ('ugx', 'usd'));

-- Single-row table holding the site's exchange rate settings.
CREATE TABLE IF NOT EXISTS exchange_rate_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true,
  mode TEXT NOT NULL DEFAULT 'live' CHECK (mode IN ('live', 'manual')),
  manual_rate NUMERIC,
  cached_live_rate NUMERIC,
  cached_live_rate_fetched_at TIMESTAMPTZ,
  CONSTRAINT exchange_rate_settings_single_row CHECK (id)
);

INSERT INTO exchange_rate_settings (id, mode)
VALUES (true, 'live')
ON CONFLICT (id) DO NOTHING;
