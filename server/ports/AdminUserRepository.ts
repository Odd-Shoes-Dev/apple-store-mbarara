import { AdminUser } from "../domain/types";

export interface AdminUserRepository {
  getByEmail(email: string): Promise<AdminUser | null>;
}
