import { Pool } from "pg";
import { RepairRequestRepository } from "../../../ports/RepairRequestRepository";
import { NewRepairRequestInput, RepairRequest } from "../../../domain/types";

type RepairRequestRow = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  device_name: string;
  device_type: string;
  issue_description: string;
  status: RepairRequest['status'];
  admin_note: string | null;
  created_at: Date;
  updated_at: Date;
};

function mapRepairRequest(row: RepairRequestRow): RepairRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    deviceName: row.device_name,
    deviceType: row.device_type,
    issueDescription: row.issue_description,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PgRepairRequestRepository implements RepairRequestRepository {
  constructor(private readonly db: Pool) {}

  async create(input: NewRepairRequestInput): Promise<RepairRequest> {
    const result = await this.db.query<RepairRequestRow>(
      `INSERT INTO repair_requests (customer_name, phone, email, device_name, device_type, issue_description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [input.customerName, input.phone, input.email ?? null, input.deviceName, input.deviceType, input.issueDescription]
    );
    return mapRepairRequest(result.rows[0]);
  }

  async list(): Promise<RepairRequest[]> {
    const result = await this.db.query<RepairRequestRow>(
      `SELECT * FROM repair_requests ORDER BY created_at DESC`
    );
    return result.rows.map(mapRepairRequest);
  }

  async getById(id: string): Promise<RepairRequest | null> {
    const result = await this.db.query<RepairRequestRow>(
      `SELECT * FROM repair_requests WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? mapRepairRequest(result.rows[0]) : null;
  }

  async updateStatus(
    id: string,
    status: RepairRequest['status'],
    adminNote?: string | null
  ): Promise<RepairRequest> {
    const result = await this.db.query<RepairRequestRow>(
      `UPDATE repair_requests SET status = $1, admin_note = COALESCE($2, admin_note), updated_at = now()
       WHERE id = $3 RETURNING *`,
      [status, adminNote ?? null, id]
    );
    return mapRepairRequest(result.rows[0]);
  }
}
