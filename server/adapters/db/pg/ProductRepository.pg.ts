import { Pool } from "pg";
import { ProductRepository } from "../../../ports/ProductRepository";
import {
  NewProductInput,
  Product,
  ProductListFilter,
  UpdateProductInput,
} from "../../../domain/types";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  currency: string;
  category_id: string | null;
  active: boolean;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
  cat_id: string | null;
  cat_name: string | null;
  cat_slug: string | null;
  cat_parent_id: string | null;
  cat_position: number | null;
};

type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  key: string;
  position: number;
};

const PRODUCT_SELECT = `
  SELECT p.*, c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.parent_id AS cat_parent_id, c.position AS cat_position
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

function mapProduct(row: ProductRow, images: ProductImageRow[]): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    category: row.cat_id
      ? {
          id: row.cat_id,
          name: row.cat_name!,
          slug: row.cat_slug!,
          parentId: row.cat_parent_id,
          position: row.cat_position!,
        }
      : null,
    active: row.active,
    isFeatured: row.is_featured,
    images: images
      .filter((image) => image.product_id === row.id)
      .sort((a, b) => a.position - b.position)
      .map((image) => ({
        id: image.id,
        url: image.url,
        key: image.key,
        position: image.position,
      })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchImagesFor(db: Pool, productIds: string[]): Promise<ProductImageRow[]> {
  if (productIds.length === 0) {
    return [];
  }

  const result = await db.query<ProductImageRow>(
    `SELECT id, product_id, url, key, position FROM product_images WHERE product_id = ANY($1)`,
    [productIds]
  );
  return result.rows;
}

export class PgProductRepository implements ProductRepository {
  constructor(private readonly db: Pool) {}

  async list(filter: ProductListFilter): Promise<Product[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.active !== undefined) {
      params.push(filter.active);
      conditions.push(`p.active = $${params.length}`);
    }

    if (filter.categoryIds && filter.categoryIds.length > 0) {
      params.push(filter.categoryIds);
      conditions.push(`p.category_id = ANY($${params.length})`);
    }

    if (filter.search) {
      params.push(`%${filter.search}%`);
      conditions.push(`p.name ILIKE $${params.length}`);
    }

    if (filter.featured !== undefined) {
      params.push(filter.featured);
      conditions.push(`p.is_featured = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await this.db.query<ProductRow>(
      `${PRODUCT_SELECT} ${where} ORDER BY p.created_at DESC`,
      params
    );

    const images = await fetchImagesFor(this.db, result.rows.map((row) => row.id));
    return result.rows.map((row) => mapProduct(row, images));
  }

  async getById(id: string): Promise<Product | null> {
    const result = await this.db.query<ProductRow>(`${PRODUCT_SELECT} WHERE p.id = $1`, [id]);
    const row = result.rows[0];
    if (!row) {
      return null;
    }

    const images = await fetchImagesFor(this.db, [row.id]);
    return mapProduct(row, images);
  }

  async getManyByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }

    const result = await this.db.query<ProductRow>(`${PRODUCT_SELECT} WHERE p.id = ANY($1)`, [ids]);
    const images = await fetchImagesFor(this.db, result.rows.map((row) => row.id));
    return result.rows.map((row) => mapProduct(row, images));
  }

  async create(input: NewProductInput): Promise<Product> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const productResult = await client.query<{ id: string }>(
        `INSERT INTO products (name, slug, description, price_cents, currency, category_id, active, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          input.name,
          input.slug,
          input.description,
          input.priceCents,
          input.currency,
          input.categoryId,
          input.active,
          input.isFeatured,
        ]
      );
      const id = productResult.rows[0].id;

      for (const image of input.images) {
        await client.query(
          `INSERT INTO product_images (product_id, url, key, position) VALUES ($1, $2, $3, $4)`,
          [id, image.url, image.key, image.position]
        );
      }

      await client.query("COMMIT");

      const row = (await client.query<ProductRow>(`${PRODUCT_SELECT} WHERE p.id = $1`, [id])).rows[0];
      const images = await fetchImagesFor(this.db, [id]);
      return mapProduct(row, images);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const sets: string[] = [];
      const params: unknown[] = [];

      const fieldMap: [keyof UpdateProductInput, string][] = [
        ["name", "name"],
        ["slug", "slug"],
        ["description", "description"],
        ["priceCents", "price_cents"],
        ["currency", "currency"],
        ["categoryId", "category_id"],
        ["active", "active"],
        ["isFeatured", "is_featured"],
      ];

      for (const [key, column] of fieldMap) {
        if (input[key] !== undefined) {
          params.push(input[key]);
          sets.push(`${column} = $${params.length}`);
        }
      }

      if (sets.length > 0) {
        params.push(id);
        await client.query(`UPDATE products SET ${sets.join(", ")} WHERE id = $${params.length}`, params);
      }

      if (input.images) {
        await client.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
        for (const image of input.images) {
          await client.query(
            `INSERT INTO product_images (product_id, url, key, position) VALUES ($1, $2, $3, $4)`,
            [id, image.url, image.key, image.position]
          );
        }
      }

      await client.query("COMMIT");

      const row = (await client.query<ProductRow>(`${PRODUCT_SELECT} WHERE p.id = $1`, [id])).rows[0];
      const images = await fetchImagesFor(this.db, [id]);
      return mapProduct(row, images);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async archive(id: string): Promise<void> {
    await this.db.query(`UPDATE products SET active = false WHERE id = $1`, [id]);
  }
}
