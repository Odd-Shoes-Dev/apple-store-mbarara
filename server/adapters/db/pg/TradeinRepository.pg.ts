import { Pool } from "pg";
import { TradeinRepository } from "../../../ports/TradeinRepository";
import { NewTradeinInput, TradeinRequest } from "../../../domain/types";

type TradeinRow = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  device_name: string;
  device_condition: string;
  notes: string | null;
  status: TradeinRequest['status'];
  admin_note: string | null;
  created_at: Date;
  updated_at: Date;
};

function mapTradein(row: TradeinRow): TradeinRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    deviceName: row.device_name,
    deviceCondition: row.device_condition,
    notes: row.notes,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PgTradeinRepository implements TradeinRepository {
  constructor(private readonly db: Pool) {}

  async create(input: NewTradeinInput): Promise<TradeinRequest> {
    const result = await this.db.query<TradeinRow>(
      `INSERT INTO tradein_requests (customer_name, phone, email, device_name, device_condition, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [input.customerName, input.phone, input.email ?? null, input.deviceName, input.deviceCondition, input.notes ?? null]
    );
    return mapTradein(result.rows[0]);
  }

  async list(): Promise<TradeinRequest[]> {
    const result = await this.db.query<TradeinRow>(
      `SELECT * FROM tradein_requests ORDER BY created_at DESC`
    );
    return result.rows.map(mapTradein);
  }

  async getById(id: string): Promise<TradeinRequest | null> {
    const result = await this.db.query<TradeinRow>(
      `SELECT * FROM tradein_requests WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? mapTradein(result.rows[0]) : null;
  }

  async updateStatus(
    id: string,
    status: TradeinRequest['status'],
    adminNote?: string | null
  ): Promise<TradeinRequest> {
    const result = await this.db.query<TradeinRow>(
      `UPDATE tradein_requests SET status = $1, admin_note = COALESCE($2, admin_note), updated_at = now()
       WHERE id = $3 RETURNING *`,
      [status, adminNote ?? null, id]
    );
    return mapTradein(result.rows[0]);
  }
}
