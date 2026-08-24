// One-time follow-up to seedFromStripe.js: downloads every still-Stripe-hosted product image
// (marked with a "stripe-import-" placeholder key) and re-uploads it to ImageKit, so nothing on
// the storefront depends on Stripe's hosting anymore. Usage: node scripts/migrateImagesToImageKit.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const { Pool } = require("pg");
const { ImageKit } = require("@imagekit/nodejs");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const appFolder = process.env.IMAGEKIT_APP_FOLDER;

  if (!databaseUrl || !privateKey || !appFolder) {
    console.error(
      "DATABASE_URL, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_APP_FOLDER must be set (check .env.local)"
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const imagekit = new ImageKit({ privateKey });
  const folder = `/${appFolder}/products`;

  const { rows } = await pool.query(
    `SELECT id, product_id, url FROM product_images WHERE key LIKE 'stripe-import-%' ORDER BY product_id, position`
  );

  console.log(`Found ${rows.length} Stripe-hosted image(s) to migrate`);

  for (const row of rows) {
    try {
      const response = await fetch(row.url);
      if (!response.ok) {
        console.error(`  skip ${row.id}: failed to download (HTTP ${response.status})`);
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const filename = row.url.split("/").pop()?.split("?")[0] || `${row.id}.jpg`;

      const file = await ImageKit.toFile(buffer, filename);
      const result = await imagekit.files.upload({ file, fileName: filename, folder });

      if (!result.url || !result.fileId) {
        console.error(`  skip ${row.id}: ImageKit upload returned no url/fileId`);
        continue;
      }

      await pool.query(`UPDATE product_images SET url = $1, key = $2 WHERE id = $3`, [
        result.url,
        result.fileId,
        row.id,
      ]);

      console.log(`  migrated ${row.id} (product ${row.product_id}) -> ${result.url}`);
    } catch (err) {
      console.error(`  error on ${row.id}:`, err.message);
    }
  }

  await pool.end();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
