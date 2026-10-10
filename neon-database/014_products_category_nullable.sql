-- 014_products_category_nullable.sql

-- products.category_id was marked NOT NULL while its FK says
-- ON DELETE SET NULL, so deleting a category with any linked products
-- failed with a not-null violation instead of uncategorizing them
-- (the admin UI already promises "products become uncategorized, not
-- deleted"). The domain model already treats Product.category as
-- nullable — this migration just makes the schema match that.
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;
