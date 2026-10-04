import { Pool } from "pg";
import { ReviewRepository } from "../../../ports/ReviewRepository";
import { NewReviewInput, Review } from "../../../domain/types";

type ReviewRow = {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  body: string | null;
  approved: boolean;
  created_at: Date;
};

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    body: row.body,
    approved: row.approved,
    createdAt: row.created_at,
  };
}

export class PgReviewRepository implements ReviewRepository {
  constructor(private readonly db: Pool) {}

  async listApproved(productId: string): Promise<Review[]> {
    const result = await this.db.query<ReviewRow>(
      `SELECT * FROM reviews WHERE product_id = $1 AND approved = true ORDER BY created_at DESC`,
      [productId]
    );
    return result.rows.map(mapReview);
  }

  async listAll(): Promise<Review[]> {
    const result = await this.db.query<ReviewRow>(
      `SELECT * FROM reviews ORDER BY created_at DESC`
    );
    return result.rows.map(mapReview);
  }

  async create(input: NewReviewInput): Promise<Review> {
    const result = await this.db.query<ReviewRow>(
      `INSERT INTO reviews (product_id, reviewer_name, rating, body)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [input.productId, input.reviewerName, input.rating, input.body ?? null]
    );
    return mapReview(result.rows[0]);
  }

  async approve(id: string): Promise<void> {
    await this.db.query(`UPDATE reviews SET approved = true WHERE id = $1`, [id]);
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM reviews WHERE id = $1`, [id]);
  }
}
