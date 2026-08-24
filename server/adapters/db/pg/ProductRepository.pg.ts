import { Pool } from "pg";
import { ProductRepository } from "../../../ports/ProductRepository";
import {
  NewProductInput,
  Product,
  ProductCategory,
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
  category: ProductCategory;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  key: string;
  position: number;
};

function mapProduct(row: ProductRow, images: ProductImageRow[]): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    category: row.category,
    active: row.active,
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
      conditions.push(`active = $${params.length}`);
    }

    if (filter.category) {
      params.push(filter.category);
      conditions.push(`category = $${params.length}`);
    }

    if (filter.search) {
      params.push(`%${filter.search}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await this.db.query<ProductRow>(
      `SELECT * FROM products ${where} ORDER BY created_at DESC`,
      params
    );

    const images = await fetchImagesFor(this.db, result.rows.map((row) => row.id));
    return result.rows.map((row) => mapProduct(row, images));
  }

  async getById(id: string): Promise<Product | null> {
    const result = await this.db.query<ProductRow>(`SELECT * FROM products WHERE id = $1`, [id]);
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

    const result = await this.db.query<ProductRow>(`SELECT * FROM products WHERE id = ANY($1)`, [ids]);
    const images = await fetchImagesFor(this.db, result.rows.map((row) => row.id));
    return result.rows.map((row) => mapProduct(row, images));
  }

  async create(input: NewProductInput): Promise<Product> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const productResult = await client.query<ProductRow>(
        `INSERT INTO products (name, slug, description, price_cents, currency, category, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          input.name,
          input.slug,
          input.description,
          input.priceCents,
          input.currency,
          input.category,
          input.active,
        ]
      );
      const row = productResult.rows[0];

      for (const image of input.images) {
        await client.query(
          `INSERT INTO product_images (product_id, url, key, position) VALUES ($1, $2, $3, $4)`,
          [row.id, image.url, image.key, image.position]
        );
      }

      await client.query("COMMIT");

      const images = await fetchImagesFor(this.db, [row.id]);
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
        ["category", "category"],
        ["active", "active"],
      ];

      for (const [key, column] of fieldMap) {
        if (input[key] !== undefined) {
          params.push(input[key]);
          sets.push(`${column} = $${params.length}`);
        }
      }

      let row: ProductRow;
      if (sets.length > 0) {
        params.push(id);
        const result = await client.query<ProductRow>(
          `UPDATE products SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
          params
        );
        row = result.rows[0];
      } else {
        const result = await client.query<ProductRow>(`SELECT * FROM products WHERE id = $1`, [id]);
        row = result.rows[0];
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
