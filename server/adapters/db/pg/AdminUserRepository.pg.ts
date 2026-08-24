import { Pool } from "pg";
import { AdminUserRepository } from "../../../ports/AdminUserRepository";
import { AdminUser } from "../../../domain/types";

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
};

export class PgAdminUserRepository implements AdminUserRepository {
  constructor(private readonly db: Pool) {}

  async getByEmail(email: string): Promise<AdminUser | null> {
    const result = await this.db.query<AdminUserRow>(`SELECT * FROM admin_users WHERE email = $1`, [
      email,
    ]);
    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
    };
  }
}
