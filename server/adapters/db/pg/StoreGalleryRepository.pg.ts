import { Pool } from "pg";
import { StoreGalleryRepository } from "../../../ports/StoreGalleryRepository";
import { NewStoreGalleryImageInput, StoreGalleryImage, UpdateStoreGalleryImageInput } from "../../../domain/types";

type StoreGalleryRow = {
  id: string;
  image_url: string;
  image_key: string;
  caption: string | null;
  position: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

function mapImage(row: StoreGalleryRow): StoreGalleryImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    imageKey: row.image_key,
    caption: row.caption,
    position: row.position,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PgStoreGalleryRepository implements StoreGalleryRepository {
  constructor(private readonly db: Pool) {}

  async listActive(): Promise<StoreGalleryImage[]> {
    const result = await this.db.query<StoreGalleryRow>(
      `SELECT * FROM store_gallery_images WHERE active = true ORDER BY position ASC, created_at ASC`
    );
    return result.rows.map(mapImage);
  }

  async listAll(): Promise<StoreGalleryImage[]> {
    const result = await this.db.query<StoreGalleryRow>(
      `SELECT * FROM store_gallery_images ORDER BY position ASC, created_at ASC`
    );
    return result.rows.map(mapImage);
  }

  async getById(id: string): Promise<StoreGalleryImage | null> {
    const result = await this.db.query<StoreGalleryRow>(
      `SELECT * FROM store_gallery_images WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? mapImage(result.rows[0]) : null;
  }

  async create(input: NewStoreGalleryImageInput): Promise<StoreGalleryImage> {
    const result = await this.db.query<StoreGalleryRow>(
      `INSERT INTO store_gallery_images (image_url, image_key, caption, position, active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [input.imageUrl, input.imageKey, input.caption, input.position, input.active]
    );
    return mapImage(result.rows[0]);
  }

  async update(id: string, input: UpdateStoreGalleryImageInput): Promise<StoreGalleryImage> {
    const sets: string[] = [];
    const params: unknown[] = [];

    const fieldMap: [keyof UpdateStoreGalleryImageInput, string][] = [
      ["imageUrl", "image_url"],
      ["imageKey", "image_key"],
      ["caption", "caption"],
      ["position", "position"],
      ["active", "active"],
    ];

    for (const [key, col] of fieldMap) {
      if (input[key] !== undefined) {
        params.push(input[key]);
        sets.push(`${col} = $${params.length}`);
      }
    }

    if (sets.length > 0) {
      sets.push(`updated_at = now()`);
      params.push(id);
      await this.db.query(
        `UPDATE store_gallery_images SET ${sets.join(", ")} WHERE id = $${params.length}`,
        params
      );
    }

    return (await this.getById(id))!;
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM store_gallery_images WHERE id = $1`, [id]);
  }
}
