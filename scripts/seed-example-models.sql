-- One-off demo seed, NOT a tracked migration (deliberately outside /neon-database so
-- scripts/migrate.js never picks it up). Run manually whenever you want example model
-- categories to see the header dropdown / mobile category page in action.
--
-- Run with: psql "$DATABASE_URL" -f scripts/seed-example-models.sql
-- (or paste into the Neon SQL editor)
--
-- Safe to re-run: category inserts are idempotent (ON CONFLICT DO NOTHING), and the
-- product reassignments only touch rows that still match the name pattern.

INSERT INTO categories (name, slug, parent_id, position)
SELECT 'MacBook Air', 'macbook-air', id, 0 FROM categories WHERE slug = 'mac'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, position)
SELECT 'MacBook Pro 13', 'macbook-pro-13', id, 1 FROM categories WHERE slug = 'mac'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, position)
SELECT 'MacBook Pro 16', 'macbook-pro-16', id, 2 FROM categories WHERE slug = 'mac'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, position)
SELECT 'iPhone 13', 'iphone-13', id, 0 FROM categories WHERE slug = 'iphone'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, position)
SELECT 'iPhone 14', 'iphone-14', id, 1 FROM categories WHERE slug = 'iphone'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, position)
SELECT 'iPhone 15', 'iphone-15', id, 2 FROM categories WHERE slug = 'iphone'
ON CONFLICT (slug) DO NOTHING;

-- Reassign existing products to the new models where the name is a clear match.
-- Anything that doesn't match stays on "All Mac" / "All iPhone" — nothing is deleted
-- or broken either way, and images are untouched (existing product images are reused as-is).

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'macbook-air')
WHERE name ILIKE '%macbook air%';

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'macbook-pro-16')
WHERE name ILIKE '%macbook pro 16%' OR name ILIKE '%macbook pro%16%';

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'macbook-pro-13')
WHERE name ILIKE '%macbook pro 13%' OR name ILIKE '%macbook pro%13%';

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'iphone-13')
WHERE name ILIKE '%iphone 13%';

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'iphone-14')
WHERE name ILIKE '%iphone 14%';

UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'iphone-15')
WHERE name ILIKE '%iphone 15%';
