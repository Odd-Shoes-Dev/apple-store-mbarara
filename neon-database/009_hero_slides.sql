-- 009_hero_slides.sql
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  category_label TEXT,
  price_label TEXT,
  image_url TEXT,
  image_key TEXT,
  cta_primary_label TEXT NOT NULL DEFAULT 'Shop Now',
  cta_primary_href TEXT NOT NULL DEFAULT '/store',
  background_color TEXT NOT NULL DEFAULT '#000000',
  accent_color TEXT NOT NULL DEFAULT '#c9a15a',
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
