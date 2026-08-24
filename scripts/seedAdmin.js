// Creates (or updates the password for) one admin user, since there's no signup flow.
// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... node scripts/seedAdmin.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  if (!email || !password || !databaseUrl) {
    console.error("Set ADMIN_EMAIL, ADMIN_PASSWORD, and DATABASE_URL before running this script");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const pool = new Pool({ connectionString: databaseUrl });

  await pool.query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email.toLowerCase().trim(), passwordHash]
  );

  await pool.end();
  console.log(`Admin user ready: ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
