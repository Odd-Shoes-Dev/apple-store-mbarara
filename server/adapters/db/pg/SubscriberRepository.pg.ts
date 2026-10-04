import { Pool } from "pg";
import { SubscriberRepository } from "../../../ports/SubscriberRepository";
import { Subscriber } from "../../../domain/types";

type SubscriberRow = {
  id: string;
  email: string;
  created_at: Date;
};

function mapSubscriber(row: SubscriberRow): Subscriber {
  return { id: row.id, email: row.email, createdAt: row.created_at };
}

export class PgSubscriberRepository implements SubscriberRepository {
  constructor(private readonly db: Pool) {}

  async subscribe(email: string): Promise<Subscriber> {
    const result = await this.db.query<SubscriberRow>(
      `INSERT INTO subscribers (email) VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING *`,
      [email]
    );
    return mapSubscriber(result.rows[0]);
  }

  async list(): Promise<Subscriber[]> {
    const result = await this.db.query<SubscriberRow>(
      `SELECT * FROM subscribers ORDER BY created_at DESC`
    );
    return result.rows.map(mapSubscriber);
  }
}
