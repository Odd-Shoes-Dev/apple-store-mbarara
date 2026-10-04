import { Pool } from "pg";
import { SpecRepository } from "../../../ports/SpecRepository";
import { ProductSpec } from "../../../domain/types";

type SpecRow = {
  id: string;
  product_id: string;
  label: string;
  value: string;
  position: number;
};

function mapSpec(row: SpecRow): ProductSpec {
  return {
    id: row.id,
    productId: row.product_id,
    label: row.label,
    value: row.value,
    position: row.position,
  };
}

export class PgSpecRepository implements SpecRepository {
  constructor(private readonly db: Pool) {}

  async listForProduct(productId: string): Promise<ProductSpec[]> {
    const result = await this.db.query<SpecRow>(
      `SELECT * FROM product_specs WHERE product_id = $1 ORDER BY position`,
      [productId]
    );
    return result.rows.map(mapSpec);
  }

  async replaceForProduct(
    productId: string,
    specs: { label: string; value: string; position: number }[]
  ): Promise<ProductSpec[]> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM product_specs WHERE product_id = $1`, [productId]);
      for (const spec of specs) {
        await client.query(
          `INSERT INTO product_specs (product_id, label, value, position) VALUES ($1, $2, $3, $4)`,
          [productId, spec.label, spec.value, spec.position]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
    return this.listForProduct(productId);
  }
}
