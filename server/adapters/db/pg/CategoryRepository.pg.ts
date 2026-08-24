import { Pool } from "pg";
import { CategoryRepository } from "../../../ports/CategoryRepository";
import { Category, NewCategoryInput, UpdateCategoryInput } from "../../../domain/types";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  position: number;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    position: row.position,
  };
}

export class PgCategoryRepository implements CategoryRepository {
  constructor(private readonly db: Pool) {}

  async listAll(): Promise<Category[]> {
    const result = await this.db.query<CategoryRow>(`SELECT * FROM categories ORDER BY position ASC`);
    return result.rows.map(mapCategory);
  }

  async listDepartments(): Promise<Category[]> {
    const result = await this.db.query<CategoryRow>(
      `SELECT * FROM categories WHERE parent_id IS NULL ORDER BY position ASC`
    );
    return result.rows.map(mapCategory);
  }

  async listChildren(parentId: string): Promise<Category[]> {
    const result = await this.db.query<CategoryRow>(
      `SELECT * FROM categories WHERE parent_id = $1 ORDER BY position ASC`,
      [parentId]
    );
    return result.rows.map(mapCategory);
  }

  async getById(id: string): Promise<Category | null> {
    const result = await this.db.query<CategoryRow>(`SELECT * FROM categories WHERE id = $1`, [id]);
    const row = result.rows[0];
    return row ? mapCategory(row) : null;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const result = await this.db.query<CategoryRow>(`SELECT * FROM categories WHERE slug = $1`, [slug]);
    const row = result.rows[0];
    return row ? mapCategory(row) : null;
  }

  async create(input: NewCategoryInput): Promise<Category> {
    const siblingCount = await this.db.query<{ count: string }>(
      input.parentId
        ? `SELECT COUNT(*) FROM categories WHERE parent_id = $1`
        : `SELECT COUNT(*) FROM categories WHERE parent_id IS NULL`,
      input.parentId ? [input.parentId] : []
    );
    const position = parseInt(siblingCount.rows[0].count, 10);

    const result = await this.db.query<CategoryRow>(
      `INSERT INTO categories (name, slug, parent_id, position) VALUES ($1, $2, $3, $4) RETURNING *`,
      [input.name, input.slug, input.parentId, position]
    );

    return mapCategory(result.rows[0]);
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const sets: string[] = [];
    const params: unknown[] = [];

    const fieldMap: [keyof UpdateCategoryInput, string][] = [
      ["name", "name"],
      ["slug", "slug"],
      ["parentId", "parent_id"],
    ];

    for (const [key, column] of fieldMap) {
      if (input[key] !== undefined) {
        params.push(input[key]);
        sets.push(`${column} = $${params.length}`);
      }
    }

    if (sets.length === 0) {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Category ${id} not found`);
      }
      return existing;
    }

    params.push(id);
    const result = await this.db.query<CategoryRow>(
      `UPDATE categories SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params
    );

    return mapCategory(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM categories WHERE id = $1`, [id]);
  }
}
