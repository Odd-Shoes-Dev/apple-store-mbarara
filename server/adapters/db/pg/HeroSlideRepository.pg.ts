import { Pool } from "pg";
import { HeroSlideRepository } from "../../../ports/HeroSlideRepository";
import { HeroSlide, NewHeroSlideInput, UpdateHeroSlideInput } from "../../../domain/types";

type HeroSlideRow = {
  id: string;
  title: string;
  subtitle: string | null;
  category_label: string | null;
  price_label: string | null;
  image_url: string | null;
  image_key: string | null;
  cta_primary_label: string;
  cta_primary_href: string;
  background_color: string;
  accent_color: string;
  position: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

function mapSlide(row: HeroSlideRow): HeroSlide {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    categoryLabel: row.category_label,
    priceLabel: row.price_label,
    imageUrl: row.image_url,
    imageKey: row.image_key,
    ctaPrimaryLabel: row.cta_primary_label,
    ctaPrimaryHref: row.cta_primary_href,
    backgroundColor: row.background_color,
    accentColor: row.accent_color,
    position: row.position,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PgHeroSlideRepository implements HeroSlideRepository {
  constructor(private readonly db: Pool) {}

  async listActive(): Promise<HeroSlide[]> {
    const result = await this.db.query<HeroSlideRow>(
      `SELECT * FROM hero_slides WHERE active = true ORDER BY position ASC, created_at ASC`
    );
    return result.rows.map(mapSlide);
  }

  async listAll(): Promise<HeroSlide[]> {
    const result = await this.db.query<HeroSlideRow>(
      `SELECT * FROM hero_slides ORDER BY position ASC, created_at ASC`
    );
    return result.rows.map(mapSlide);
  }

  async getById(id: string): Promise<HeroSlide | null> {
    const result = await this.db.query<HeroSlideRow>(
      `SELECT * FROM hero_slides WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? mapSlide(result.rows[0]) : null;
  }

  async create(input: NewHeroSlideInput): Promise<HeroSlide> {
    const result = await this.db.query<HeroSlideRow>(
      `INSERT INTO hero_slides
        (title, subtitle, category_label, price_label, image_url, image_key,
         cta_primary_label, cta_primary_href, background_color, accent_color, position, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        input.title, input.subtitle ?? null, input.categoryLabel ?? null,
        input.priceLabel ?? null, input.imageUrl ?? null, input.imageKey ?? null,
        input.ctaPrimaryLabel, input.ctaPrimaryHref,
        input.backgroundColor, input.accentColor,
        input.position, input.active,
      ]
    );
    return mapSlide(result.rows[0]);
  }

  async update(id: string, input: UpdateHeroSlideInput): Promise<HeroSlide> {
    const sets: string[] = [];
    const params: unknown[] = [];

    const fieldMap: [keyof UpdateHeroSlideInput, string][] = [
      ["title", "title"],
      ["subtitle", "subtitle"],
      ["categoryLabel", "category_label"],
      ["priceLabel", "price_label"],
      ["imageUrl", "image_url"],
      ["imageKey", "image_key"],
      ["ctaPrimaryLabel", "cta_primary_label"],
      ["ctaPrimaryHref", "cta_primary_href"],
      ["backgroundColor", "background_color"],
      ["accentColor", "accent_color"],
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
        `UPDATE hero_slides SET ${sets.join(", ")} WHERE id = $${params.length}`,
        params
      );
    }

    return (await this.getById(id))!;
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM hero_slides WHERE id = $1`, [id]);
  }
}
