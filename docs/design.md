# Apple Store — Design & Architecture Documentation

## Overview

A Next.js 12 Apple product dealer storefront with a full admin dashboard. Built for a local Apple dealer (Mbarara, Uganda) that sells brand-new and UK-used Apple products, handles trade-ins, and will eventually support mobile money payments (Paystack / Flutterwave) alongside Stripe.

---

## Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 12.3.7 (Pages Router) | SSR out of the box, stable API routes |
| Language | TypeScript 5.9 | Type safety across server + client |
| Styling | Tailwind CSS v3 | Utility-first, JIT, no extra build step |
| Database | Neon (serverless Postgres) | Scales to zero, no cold-start penalty for a low-traffic store |
| DB access | `pg` (raw SQL) | No ORM — full control, no magic, easy to read migrations |
| Auth | NextAuth v4 (Credentials) | JWT sessions, no database session table needed |
| Image storage | ImageKit (`@imagekit/nodejs` v7) | CDN delivery, on-the-fly transforms, scoped folder per project |
| Payments | Stripe Checkout | Swappable — adapter pattern means Paystack/Flutterwave can replace it |
| UI components | Headless UI + Heroicons | Accessible dropdowns/popovers, consistent with Tailwind |
| Validation | Zod | Schema validation on all API inputs |

---

## Architecture — Ports & Adapters

The rule: **no SDK or third-party library is called directly from pages, components, or services.** All third-party calls go through an adapter that implements a port (interface). This makes swapping providers (database, storage, payments) a one-file change.

```
pages / components
      │
      ▼
server/services/          ← business logic, orchestration
      │
      ▼
server/ports/             ← TypeScript interfaces (the contracts)
      │
      ▼
server/adapters/          ← concrete implementations (pg, imagekit, stripe)
      │
      ▼
third-party SDKs / Neon DB / ImageKit API / Stripe API
```

### Key constraint
`/server` never imports from `next`. This means the entire server layer can be extracted into a standalone Node.js backend without any Next.js changes — just point the pages at the new API URLs.

### Provider singletons
`server/config/providers.ts` — one getter per adapter (e.g. `getProductRepository()`, `getCategoryRepository()`, `getImageStorage()`). Constructed once and reused.

`server/config/services.ts` — one getter per service (e.g. `getCatalogService()`, `getCategoryService()`). Services depend on ports, not on adapters directly.

---

## Database

### Migrations
Numbered SQL files in `neon-database/`. Run in order by `scripts/migrate.js` which tracks applied migrations in a `_migrations` table.

```
neon-database/
  001_init.sql              — products, product_images, admin_users, set_updated_at trigger
  002_add_ipad_accessories.sql  — (superseded by 003, kept for history)
  003_categories.sql        — categories table, backfill, drop product_category enum
```

Run migrations:
```bash
npm run db:migrate
```

### Schema overview

```sql
products
  id, name, description, price_cents, active,
  category_id → categories(id),
  created_at, updated_at

product_images
  id, product_id → products(id), url, position

categories
  id, name, slug (unique), parent_id → categories(id),
  position, created_at, updated_at

admin_users
  id, email (unique), password_hash, created_at
```

---

## Directory Structure

```
apple-store/
├── components/
│   ├── admin/              — admin-only form components (ProductForm, CategoryForm)
│   ├── context/            — CartContext (client-side cart state)
│   ├── Footer.tsx
│   ├── Header.tsx          — sticky nav with category dropdowns, cart popover
│   ├── ProductCard.tsx
│   ├── Spinner.tsx
│   └── WatchShowcase.tsx   — interactive watch band/case selector
├── docs/                   — this folder
├── neon-database/          — numbered SQL migration files
├── pages/
│   ├── admin/              — dashboard pages (products, categories, etc.)
│   ├── api/
│   │   ├── admin/          — protected API routes (requireAdminApi guard)
│   │   ├── checkout.ts
│   │   └── ...
│   ├── category/[slug].tsx — mobile department landing page
│   ├── products/[pageId].tsx
│   ├── index.tsx           — homepage with search + filter
│   └── _app.tsx            — CartContext provider, Footer, WatchShowcase
├── public/
│   ├── icons/              — footer product icons (PNG)
│   ├── sounds/             — cart notification sounds
│   └── watches/            — watch band and case images
├── scripts/
│   ├── migrate.js          — applies neon-database/*.sql in order
│   ├── seed-example-models.sql  — demo categories (not tracked by migrate.js)
│   └── seedFromStripe.js   — one-off: pull existing products from Stripe into DB
├── server/
│   ├── adapters/
│   │   ├── db/pg/          — Postgres implementations of repository ports
│   │   ├── imageStorage/   — ImageKit implementation of ImageStoragePort
│   │   └── payment/        — Stripe implementation of PaymentPort
│   ├── config/
│   │   ├── providers.ts    — singleton getters for all adapters
│   │   └── services.ts     — singleton getters for all services
│   ├── domain/
│   │   ├── types.ts        — Product, Category, Review, etc.
│   │   └── validation.ts   — Zod schemas for API inputs
│   ├── ports/              — TypeScript interfaces (contracts)
│   └── services/           — business logic (catalogService, categoryService, etc.)
├── styles/
│   └── globals.css
└── utils/
    └── computed.ts         — getProductName, getProductPrice, formatPrice, etc.
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values. Never commit `.env.local`.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `NEXTAUTH_SECRET` | Yes | Random string — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Base URL (e.g. `http://localhost:3000`) |
| `IMAGEKIT_PUBLIC_KEY` | Yes | ImageKit dashboard → Developer options |
| `IMAGEKIT_PRIVATE_KEY` | Yes | ImageKit dashboard → Developer options |
| `IMAGEKIT_URL_ENDPOINT` | Yes | e.g. `https://ik.imagekit.io/yourname` |
| `IMAGEKIT_APP_FOLDER` | Yes | Scoped folder name e.g. `apple-store-mbarara` |
| `STRIPE_PUBLIC` | Yes | Stripe publishable key |
| `STRIPE_SECRET` | Yes | Stripe secret key |
| `PAYMENT_PROVIDER` | Yes | `stripe` (only option today) |
| `ADMIN_EMAIL` | Seed only | Used by `scripts/seedAdmin.js` |
| `ADMIN_PASSWORD` | Seed only | Used by `scripts/seedAdmin.js` |
| `NEXT_PUBLIC_CURRENCY` | No | ISO 4217 currency code, default `USD` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | e.g. `+256700000000` — for inquiry button |

---

## Key Design Decisions

### Category hierarchy
One level deep only: **departments** (Mac, iPad, iPhone…) → **models** (MacBook Air, iPhone 14…). Enforced at both UI and API layer. `resolveFilterIds()` in `categoryService` expands a department click to include all its child model IDs, so "Browse all iPhones" works without any special query.

### Currency
Prices stored as `price_cents INTEGER` in the database. `formatPrice(amount)` in `utils/computed.ts` uses `Intl.NumberFormat` with the `NEXT_PUBLIC_CURRENCY` env variable. Changing the currency requires only an env change — no code change.

### Image storage
ImageKit holds all product images. Each image URL is stored in `product_images.url`. The `ImageStoragePort` interface means ImageKit can be swapped for S3, Cloudinary, or any other service by writing a new adapter.

### Cart
Client-side only (React Context in `_app.tsx`). No cart persistence between sessions intentionally — simplifies the MVP. Cart items are passed to Stripe Checkout on checkout.

### Admin auth
Single admin account. Credentials (email + password) stored in `admin_users` table with bcrypt hash. JWT session via NextAuth. No role system — it's either admin or not.

### Payments (swappable)
`PAYMENT_PROVIDER=stripe` selects the Stripe adapter. A Paystack or Flutterwave adapter can be added in `server/adapters/payment/` and selected via the env var — no page or service code changes needed.

---

## Running Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# (fill in .env.local)

# Run database migrations
npm run db:migrate

# Seed admin user
node scripts/seedAdmin.js

# Start dev server
npm run dev
```

---

## Planned Features

> Implementation order is approximate — features marked with the same migration number can ship together.

---

### 1. Product Badges — New Arrivals & Discounts (Migration 004)

**What:** Admin marks products as "New Arrival" and/or sets an original price to show a discount. Badges appear on cards and the detail page.

**Database changes:**
```sql
ALTER TABLE products
  ADD COLUMN is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN original_price_cents INTEGER;  -- NULL = no discount
```

**Admin:** Checkbox "New Arrival" + optional "Original price" field in `ProductForm`.

**Storefront:**
- `ProductCard`: "NEW" badge (teal) or "SALE" badge (rose) top-left of image
- Strike-through original price shown below the current price
- Homepage quick-filter chips: "New Arrivals" and "On Sale" (client-side)

---

### 2. Product Condition — Brand New / UK Used / Refurbished (Migration 004)

**What:** Admin sets a condition per product. Shown as a badge on the card. Filterable on the storefront.

**Database changes:**
```sql
CREATE TYPE product_condition AS ENUM ('brand_new', 'used_uk', 'used_local', 'refurbished');
ALTER TABLE products ADD COLUMN condition product_condition NOT NULL DEFAULT 'brand_new';
```

**Labels:** Brand New · UK Used · Used · Refurbished

**Storefront:** Small condition chip below product name on card and detail page. Condition filter added to the sort/filter popover.

---

### 3. Stock & Availability (Migration 004)

**What:** Live stock count per product. "Out of stock" disables Add to Bag. "Only N left" warning at low stock.

**Database changes:**
```sql
ALTER TABLE products ADD COLUMN stock_count INTEGER NOT NULL DEFAULT 0;
```

**Admin:** Stock count field in `ProductForm`. Colour-coded stock column in product list (green ≥ 5 / amber 1–4 / red 0).

**Storefront:**
- Card: "Out of stock" ribbon over image when `stock_count = 0`
- Detail page: "Only 2 left" when `stock_count ≤ 3`; Add to Bag disabled at 0

---

### 4. Warranty & Authenticity (Migration 004)

**What:** Trust signals shown on the product detail page.

**Database changes:**
```sql
ALTER TABLE products
  ADD COLUMN warranty_months INTEGER,
  ADD COLUMN is_authentic BOOLEAN NOT NULL DEFAULT true;
```

**Storefront:** Icon row below the price — ✓ Authentic · 12-month warranty · UK Used etc.

---

### 5. WhatsApp Inquiry Button (No migration)

**What:** "Ask about this product" opens WhatsApp with a pre-filled message. Essential for a local dealer where customers negotiate stock or specs.

**Env var:** `NEXT_PUBLIC_WHATSAPP_NUMBER=+256...`

**Implementation:** Button on the detail page → `https://wa.me/{number}?text=Hi, I'm interested in {product name}`. No backend needed.

---

### 6. Product Specifications (Migration 005)

**What:** Structured key-value specs per product (Storage, RAM, Display, Chip, Battery, Colour…). Admin adds rows dynamically.

**Database:**
```sql
CREATE TABLE product_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);
```

**Admin:** Dynamic spec rows in `ProductForm` — "Add spec" appends a label + value pair.

**Storefront:** Specs table on detail page, collapsed to 6 rows with "Show all" toggle.

---

### 7. Customer Reviews & Ratings (Migration 006)

**What:** Star ratings (1–5) and written reviews per product. Admin approves before they appear. Average rating shown on cards and detail page.

**Database:**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Ports:** `ReviewRepository` — `listApproved(productId)`, `create()`, `listAll()` (admin), `approve()`, `delete()`.

**Storefront:**
- `ProductCard`: star display + review count
- Detail page: approved review list + "Leave a review" form (name, stars, comment). Submits to `POST /api/reviews` (public). Shows "Your review is pending approval" after submit.

**Admin:** `/admin/reviews` — approve or delete submitted reviews.

---

### 8. Trade-In / Swap Program (Migration 007)

**What:** "Swap your old iPhone for a new one." Customer submits a trade-in request form. Admin reviews and responds with an offer.

**Database:**
```sql
CREATE TABLE tradein_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  device_name TEXT NOT NULL,
  device_condition TEXT NOT NULL,  -- 'good' | 'fair' | 'poor'
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | reviewed | accepted | rejected
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Storefront:** `/trade-in` page with a form — device name, condition, contact details. No login required. Confirmation on submit.

**Admin:** `/admin/trade-in` — table of requests with status. Click to view details, add a note, and change status.

---

### 9. Related Products (No migration)

**What:** "You might also like" — 4 products from the same category shown at the bottom of the detail page.

**Implementation:** `catalogService.listRelated(productId, categoryId, limit = 4)` — products in the same category excluding the current one, ordered by newest. Rendered as a horizontal scroll row of `ProductCard`s.

---

### 10. Newsletter / Interest Capture (Migration 008)

**What:** Email capture above the footer on the homepage.

**Database:**
```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Storefront:** "Get notified about new arrivals and deals" form. `POST /api/subscribe` (public, unauthenticated).

**Admin:** `/admin/subscribers` — read-only list with CSV export.

---

### Future / Deferred

- **Paystack / Flutterwave adapter** — mobile money payments for Uganda. Drop in a new `PaymentAdapter` implementing `PaymentPort`; set `PAYMENT_PROVIDER=paystack`.
- **Persisted orders** — `orders` + `order_items` tables; Stripe webhook writes order on payment success. Detail page then shows real purchase history.
- **Customer accounts** — optional login, saved addresses, order history.
- **Compare products** — side-by-side spec comparison.
- **Wishlist / Saved items** — requires customer accounts.
- **Loyalty / referral program** — requires customer accounts.
