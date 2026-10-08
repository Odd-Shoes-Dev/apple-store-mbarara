-- 011_add_airpods_category.sql
INSERT INTO categories (name, slug, position)
VALUES ('AirPods', 'airpods', 4)
ON CONFLICT (slug) DO NOTHING;

-- Keep "Apple Accessories" and "Other" ordered after the new department
UPDATE categories SET position = 5 WHERE slug = 'apple-accessories';
UPDATE categories SET position = 6 WHERE slug = 'other';
