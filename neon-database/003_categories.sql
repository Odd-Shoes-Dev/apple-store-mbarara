CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent_id ON categories (parent_id);

CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO categories (name, slug, position) VALUES
  ('Mac', 'mac', 0),
  ('iPad', 'ipad', 1),
  ('iPhone', 'iphone', 2),
  ('Apple Watch', 'apple-watch', 3),
  ('Apple Accessories', 'apple-accessories', 4),
  ('Other', 'other', 5);

ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

UPDATE products SET category_id = (
  SELECT id FROM categories WHERE slug = CASE products.category
    WHEN 'IPHONE' THEN 'iphone'
    WHEN 'MACBOOK' THEN 'mac'
    WHEN 'IPAD' THEN 'ipad'
    WHEN 'WATCH' THEN 'apple-watch'
    WHEN 'ACCESSORIES' THEN 'apple-accessories'
    ELSE 'other'
  END
);

ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;

DROP INDEX IF EXISTS idx_products_category_active;
CREATE INDEX idx_products_category_active ON products (category_id, active);

ALTER TABLE products DROP COLUMN category;
DROP TYPE product_category;
