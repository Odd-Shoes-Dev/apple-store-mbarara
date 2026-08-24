// One-time cutover: pulls the existing Stripe catalog into our own Postgres tables so no
// product data is lost when the storefront stops reading from Stripe. Usage: node scripts/seedFromStripe.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const Stripe = require("stripe");
const { Pool } = require("pg");

function deviceToCategory(device) {
  switch (device) {
    case "iphone":
      return "IPHONE";
    case "macbook":
      return "MACBOOK";
    case "watch":
      return "WATCH";
    default:
      return "OTHER";
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const stripeSecret = process.env.STRIPE_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  if (!stripeSecret || !databaseUrl) {
    console.error("STRIPE_SECRET and DATABASE_URL must be set (check .env.local)");
    process.exit(1);
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2023-08-16" });
  const pool = new Pool({ connectionString: databaseUrl });

  let all = [];
  let hasMore = true;
  let startingAfter;

  while (hasMore) {
    const res = await stripe.prices.list({
      expand: ["data.product"],
      limit: 100,
      starting_after: startingAfter,
    });

    const prices = res.data.filter((price) => price.active);
    all = [...all, ...prices];
    hasMore = res.has_more;
    if (hasMore) {
      startingAfter = prices[prices.length - 1].id;
    }
  }

  console.log(`Found ${all.length} active Stripe prices`);

  for (const price of all) {
    const product = price.product;
    if (!product || product.deleted) continue;

    const slugBase = slugify(product.name);
    let slug = slugBase;
    let suffix = 1;

    const client = await pool.connect();
    try {
      while (true) {
        const existing = await client.query("SELECT id FROM products WHERE slug = $1", [slug]);
        if (existing.rows.length === 0) break;
        suffix += 1;
        slug = `${slugBase}-${suffix}`;
      }

      const result = await client.query(
        `INSERT INTO products (name, slug, description, price_cents, currency, category, active)
         VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id`,
        [
          product.name,
          slug,
          product.description ?? "",
          price.unit_amount ?? 0,
          price.currency,
          deviceToCategory(product.metadata?.device),
        ]
      );

      const productId = result.rows[0].id;

      for (const [index, url] of (product.images ?? []).entries()) {
        await client.query(
          `INSERT INTO product_images (product_id, url, key, position) VALUES ($1, $2, $3, $4)`,
          [productId, url, `stripe-import-${productId}-${index}`, index]
        );
      }

      console.log(`Imported: ${product.name}`);
    } finally {
      client.release();
    }
  }

  await pool.end();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
