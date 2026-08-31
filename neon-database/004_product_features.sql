-- 004_product_features.sql
ALTER TABLE products ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
