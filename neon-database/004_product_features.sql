-- 004_product_features.sql
-- Featured flag (may already exist if migration was partially applied)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- New Arrival & Discount badges
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price_cents INTEGER;

-- Product condition
DO $$ BEGIN
  CREATE TYPE product_condition AS ENUM ('brand_new', 'used_uk', 'used_local', 'refurbished');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
ALTER TABLE products ADD COLUMN IF NOT EXISTS condition product_condition NOT NULL DEFAULT 'brand_new';

-- Stock & availability
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_count INTEGER NOT NULL DEFAULT 0;

-- Warranty & authenticity
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_months INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_authentic BOOLEAN NOT NULL DEFAULT true;
