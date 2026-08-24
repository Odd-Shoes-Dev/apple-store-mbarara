import bcrypt from "bcryptjs";
import { AdminUserRepository } from "../ports/AdminUserRepository";
import { AdminUser } from "../domain/types";

export function createAuthService(adminUserRepository: AdminUserRepository) {
  return {
    async verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
      const user = await adminUserRepository.getByEmail(email.toLowerCase().trim());
      if (!user) {
        return null;
      }

      const matches = await bcrypt.compare(password, user.passwordHash);
      return matches ? user : null;
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
