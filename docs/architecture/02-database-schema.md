# Andromeda — Database Schema

> **Version:** 1.0 | **Status:** Draft | **Date:** June 2026
> **Canonical SQL:** [`docs/schema.sql`](../schema.sql)
> **Database:** PostgreSQL 16 (Supabase) | **Dev DB:** SQLite | **ORM:** Drizzle ORM

---

## 1. Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- password hashing helpers
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- trigram indexes for LIKE
CREATE EXTENSION IF NOT EXISTS "postgis";     -- geolocation queries
CREATE EXTENSION IF NOT EXISTS "btree_gist";  -- GiST on scalar types
```

---

## 2. Enums

| Enum | Values |
|---|---|
| `user_role` | `user` · `seller` · `admin` |
| `alert_type` | `price` · `stock` |
| `order_status` | `pending` · `confirmed` · `shipped` · `delivered` · `cancelled` · `refunded` |
| `payment_status` | `pending` · `paid` · `failed` · `refunded` |
| `seller_status` | `pending` · `active` · `suspended` · `rejected` |
| `product_status` | `draft` · `active` · `hidden` · `removed` |
| `currency_code` | `INR` · `USD` · `EUR` |

---

## 3. Entity-Relationship Diagram

```
┌─────────────┐        ┌──────────────┐       ┌─────────────────┐
│    users    │───1:1──│   sellers    │───1:N──│    products     │
│─────────────│        │──────────────│        │─────────────────│
│ id (PK)     │        │ id (PK)      │        │ id (PK)         │
│ name        │        │ user_id (FK) │        │ seller_id (FK)  │
│ email       │        │ business_name│        │ category_id(FK) │
│ role        │        │ slug         │        │ title, slug     │
│ password_   │        │ status       │        │ price           │
│   hash      │        │ is_verified  │        │ original_price  │
│ is_active   │        │ location*    │        │ discount_pct†   │
└─────────────┘        │ rating†      │        │ stock           │
       │               │ product_     │        │ specs (JSONB)   │
       │               │   count†     │        │ status          │
       │               └──────────────┘        │ rating†         │
       │                      │                └─────────────────┘
       │                      │                       │
    ┌──┴──┐              ┌────┴─────┐          ┌─────┴──────┐
    │     │              │   price  │          │  reviews   │
 accounts sessions        │  history │          │ (+ votes)  │
  (OAuth)  (DB)           │ (append) │          └────────────┘
                          └──────────┘
       │
  ┌────┴───────────────────────────────────────┐
  │                                            │
wishlists   alerts   comparisons   orders ──► order_items
                                    │
                               seller_analytics
```
`†` denormalised / generated column   `*` PostGIS geography point

---

## 4. Tables

### 4.1 Auth Tables (NextAuth.js v5 Adapter)

#### `users`

| Column | Type | Default | Constraints |
|---|---|---|---|
| `id` | `UUID` | `uuid_generate_v4()` | `PK` |
| `name` | `TEXT` | — | |
| `email` | `TEXT` | — | `UNIQUE` |
| `email_verified` | `TIMESTAMPTZ` | — | Set on email click |
| `image` | `TEXT` | — | Avatar URL |
| `password_hash` | `TEXT` | — | `NULL` for OAuth-only users |
| `role` | `user_role` | `'user'` | `NOT NULL` |
| `phone` | `TEXT` | — | |
| `is_active` | `BOOLEAN` | `TRUE` | `NOT NULL` |
| `created_at` | `TIMESTAMPTZ` | `NOW()` | `NOT NULL` |
| `updated_at` | `TIMESTAMPTZ` | `NOW()` | Auto-updated by trigger |

#### `accounts`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PK` |
| `user_id` | `UUID` | `FK → users.id ON DELETE CASCADE` |
| `type` | `TEXT` | `NOT NULL` — `'oauth'` \| `'email'` \| `'credentials'` |
| `provider` | `TEXT` | `NOT NULL` — `'google'` \| `'github'` |
| `provider_account_id` | `TEXT` | `NOT NULL` |
| `access_token` | `TEXT` | — |
| `refresh_token` | `TEXT` | — |
| `expires_at` | `BIGINT` | — |
| `(provider, provider_account_id)` | — | `UNIQUE` |

#### `sessions`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PK` |
| `session_token` | `TEXT` | `UNIQUE NOT NULL` |
| `user_id` | `UUID` | `FK → users.id ON DELETE CASCADE` |
| `expires` | `TIMESTAMPTZ` | `NOT NULL` |

#### `verification_tokens`

| Column | Type | Constraints |
|---|---|---|
| `identifier` | `TEXT` | `PK` (composite) |
| `token` | `TEXT` | `PK` (composite), `UNIQUE` |
| `expires` | `TIMESTAMPTZ` | `NOT NULL` |

#### `authenticators` (WebAuthn / Passkey — optional)

| Column | Type | Constraints |
|---|---|---|
| `credential_id` | `TEXT` | `PK` |
| `user_id` | `UUID` | `FK → users.id ON DELETE CASCADE` |
| `credential_public_key` | `TEXT` | `NOT NULL` |
| `counter` | `BIGINT` | `NOT NULL DEFAULT 0` |
| `credential_device_type` | `TEXT` | `NOT NULL` |
| `credential_backed_up` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` |

---

### 4.2 Domain Tables

#### `categories`

| Column | Type | Default | Constraints | Notes |
|---|---|---|---|---|
| `id` | `UUID` | `uuid_generate_v4()` | `PK` | |
| `name` | `TEXT` | — | `NOT NULL` | |
| `slug` | `TEXT` | — | `UNIQUE`, regex `^[a-z0-9-]+$` | URL-safe |
| `icon` | `TEXT` | — | — | Emoji or icon name |
| `description` | `TEXT` | — | — | |
| `parent_id` | `UUID` | — | `FK → categories.id ON DELETE SET NULL` | `NULL` = root category |
| `sort_order` | `INTEGER` | `0` | `NOT NULL` | |
| `is_active` | `BOOLEAN` | `TRUE` | `NOT NULL` | |
| `created_at` | `TIMESTAMPTZ` | `NOW()` | `NOT NULL` | |
| `updated_at` | `TIMESTAMPTZ` | `NOW()` | `NOT NULL` | |

> **Hierarchy:** 2-level max. Root categories have `parent_id = NULL`. Sub-categories reference a root via `parent_id`.

---

#### `sellers`

| Column | Type | Default | Constraints | Notes |
|---|---|---|---|---|
| `id` | `UUID` | `uuid_generate_v4()` | `PK` | |
| `user_id` | `UUID` | — | `UNIQUE FK → users.id ON DELETE CASCADE` | 1-to-1 with user |
| `business_name` | `TEXT` | — | `NOT NULL` | |
| `slug` | `TEXT` | — | `UNIQUE`, regex `^[a-z0-9-]+$` | |
| `description` | `TEXT` | — | — | |
| `logo_url` | `TEXT` | — | — | Cloudinary URL |
| `banner_url` | `TEXT` | — | — | |
| `website` | `TEXT` | — | — | |
| `address_line1/2` | `TEXT` | — | — | |
| `city`, `state`, `pincode`, `country` | `TEXT` | `'IN'` for country | — | |
| `location` | `GEOGRAPHY(POINT, 4326)` | — | — | PostGIS point for geo queries |
| `gstin` | `TEXT` | — | — | GST Identification Number |
| `phone`, `email` | `TEXT` | — | — | |
| `status` | `seller_status` | `'pending'` | `NOT NULL` | Admin moderation state |
| `is_verified` | `BOOLEAN` | `FALSE` | `NOT NULL` | |
| `verified_at` | `TIMESTAMPTZ` | — | — | |
| `verified_by` | `UUID` | — | `FK → users.id ON DELETE SET NULL` | Admin who verified |
| `rating` | `NUMERIC(3,2)` | `0` | `CHECK BETWEEN 0 AND 5` | Denormalised |
| `review_count` | `INTEGER` | `0` | `CHECK >= 0` | Denormalised |
| `product_count` | `INTEGER` | `0` | `CHECK >= 0` | Maintained by trigger |
| `business_hours` | `JSONB` | — | — | `{"mon": {"open": "09:00", "close": "18:00"}, "sun": null}` |

---

#### `products`

| Column | Type | Default | Constraints | Notes |
|---|---|---|---|---|
| `id` | `UUID` | `uuid_generate_v4()` | `PK` | |
| `seller_id` | `UUID` | — | `FK → sellers.id ON DELETE CASCADE` | |
| `category_id` | `UUID` | — | `FK → categories.id ON DELETE RESTRICT` | |
| `title` | `TEXT` | — | `NOT NULL` | |
| `slug` | `TEXT` | — | `UNIQUE`, regex `^[a-z0-9-]+$` | |
| `description` | `TEXT` | — | — | |
| `short_desc` | `TEXT` | — | — | ~200 chars for card display |
| `images` | `TEXT[]` | `'{}'` | `NOT NULL` | Ordered Cloudinary URLs; `images[1]` = primary |
| `thumbnail_url` | `TEXT` | — | — | |
| `price` | `NUMERIC(12,2)` | — | `NOT NULL, CHECK >= 0` | Current selling price |
| `original_price` | `NUMERIC(12,2)` | — | `CHECK >= 0` | MRP / strike-through |
| `currency` | `currency_code` | `'INR'` | `NOT NULL` | |
| `discount_pct` | `NUMERIC(5,2)` | **GENERATED** | Computed from `original_price` vs `price` | Stored column — auto-computed |
| `stock` | `INTEGER` | `0` | `NOT NULL, CHECK >= 0` | |
| `sku` | `TEXT` | — | — | |
| `specs` | `JSONB` | `'{}'` | `NOT NULL` | `{"RAM": "16GB", "Storage": "512GB"}` |
| `tags` | `TEXT[]` | `'{}'` | `NOT NULL` | GIN indexed |
| `brand` | `TEXT` | — | — | |
| `status` | `product_status` | `'draft'` | `NOT NULL` | |
| `is_featured` | `BOOLEAN` | `FALSE` | `NOT NULL` | Admin curation |
| `rating` | `NUMERIC(3,2)` | `0` | `CHECK BETWEEN 0 AND 5` | Denormalised; updated by trigger |
| `review_count` | `INTEGER` | `0` | `CHECK >= 0` | Denormalised; updated by trigger |
| `meta_title` | `TEXT` | — | — | SEO |
| `meta_description` | `TEXT` | — | — | SEO |

> **Generated column:** `discount_pct` is computed automatically as `ROUND(((original_price - price) / original_price) * 100, 2)` and stored. No application code needed.

---

#### `reviews`

| Column | Type | Default | Constraints | Notes |
|---|---|---|---|---|
| `id` | `UUID` | `uuid_generate_v4()` | `PK` | |
| `product_id` | `UUID` | — | `FK → products.id ON DELETE CASCADE` | |
| `user_id` | `UUID` | — | `FK → users.id ON DELETE CASCADE` | |
| `rating` | `SMALLINT` | — | `NOT NULL, CHECK BETWEEN 1 AND 5` | |
| `title` | `TEXT` | — | — | |
| `content` | `TEXT` | — | `NOT NULL` | |
| `is_verified_purchase` | `BOOLEAN` | `FALSE` | `NOT NULL` | Set by BEFORE INSERT trigger |
| `helpful_count` | `INTEGER` | `0` | `CHECK >= 0` | |
| `unhelpful_count` | `INTEGER` | `0` | `CHECK >= 0` | |
| `is_flagged` | `BOOLEAN` | `FALSE` | `NOT NULL` | |
| `flag_reason` | `TEXT` | — | — | |
| `is_hidden` | `BOOLEAN` | `FALSE` | `NOT NULL` | Admin moderation |
| `fraud_score` | `NUMERIC(4,3)` | — | `CHECK BETWEEN 0 AND 1` | ML-injected by FastAPI |
| `(product_id, user_id)` | — | — | `UNIQUE` | One review per user per product |

#### `review_votes`

| Column | Type | Constraints |
|---|---|---|
| `user_id` | `UUID` | `PK (composite), FK → users` |
| `review_id` | `UUID` | `PK (composite), FK → reviews` |
| `is_helpful` | `BOOLEAN` | `NOT NULL` |

---

#### `price_history` *(append-only)*

| Column | Type | Default | Constraints | Notes |
|---|---|---|---|---|
| `id` | `UUID` | `uuid_generate_v4()` | `PK` | |
| `product_id` | `UUID` | — | `FK → products.id ON DELETE CASCADE` | |
| `seller_id` | `UUID` | — | `FK → sellers.id ON DELETE CASCADE` | |
| `price` | `NUMERIC(12,2)` | — | `NOT NULL` | |
| `currency` | `currency_code` | `'INR'` | `NOT NULL` | |
| `source` | `TEXT` | `'manual'` | `NOT NULL` | `'manual'` \| `'scraper'` \| `'api'` |
| `recorded_at` | `TIMESTAMPTZ` | `NOW()` | `NOT NULL` | |

> **Append-only rule:** Never `UPDATE` or `DELETE` rows. Only `INSERT`. Alert workers query for price changes by comparing latest two records per `(product_id, seller_id)`.

> **Scale note:** Partition by `RANGE(recorded_at)` monthly using `pg_partman` when row count exceeds ~10M.

---

#### `wishlists`

| Column | Type | Default | Constraints |
|---|---|---|---|
| `id` | `UUID` | `uuid_generate_v4()` | `PK` |
| `user_id` | `UUID` | — | `FK → users.id ON DELETE CASCADE` |
| `product_id` | `UUID` | — | `FK → products.id ON DELETE CASCADE` |
| `collection_name` | `TEXT` | `'My Wishlist'` | `NOT NULL` |
| `note` | `TEXT` | — | — |
| `added_at` | `TIMESTAMPTZ` | `NOW()` | `NOT NULL` |
| `(user_id, product_id, collection_name)` | — | — | `UNIQUE` |

---

#### `alerts`

| Column | Type | Default | Constraints | Notes |
|---|---|---|---|---|
| `id` | `UUID` | `uuid_generate_v4()` | `PK` | |
| `user_id` | `UUID` | — | `FK → users.id ON DELETE CASCADE` | |
| `product_id` | `UUID` | — | `FK → products.id ON DELETE CASCADE` | |
| `alert_type` | `alert_type` | — | `NOT NULL` | |
| `target_price` | `NUMERIC(12,2)` | — | Required when `alert_type = 'price'` | Enforced by `CHECK` constraint |
| `is_active` | `BOOLEAN` | `TRUE` | `NOT NULL` | |
| `trigger_count` | `INTEGER` | `0` | `NOT NULL` | |
| `last_triggered_at` | `TIMESTAMPTZ` | — | — | Updated by notification worker |
| `(user_id, product_id, alert_type)` | — | — | `UNIQUE` | One alert of each type per product |

> **Constraint:** `CHECK (alert_type != 'price' OR target_price IS NOT NULL)` — target price is mandatory for price alerts.

---

#### `comparisons`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `PK` | |
| `session_id` | `TEXT` | `NOT NULL` | Anonymous browser session ID |
| `user_id` | `UUID` | `FK → users.id ON DELETE SET NULL` | Optional — `NULL` for anonymous |
| `product_ids` | `UUID[]` | `NOT NULL` | `CHECK array_length BETWEEN 2 AND 4` |
| `created_at` | `TIMESTAMPTZ` | `NOW()` | |

---

#### `orders`

| Column | Type | Default | Constraints | Notes |
|---|---|---|---|---|
| `id` | `UUID` | `uuid_generate_v4()` | `PK` | |
| `user_id` | `UUID` | — | `FK → users.id ON DELETE RESTRICT` | |
| `seller_id` | `UUID` | — | `FK → sellers.id ON DELETE RESTRICT` | Per-seller checkout model |
| `status` | `order_status` | `'pending'` | `NOT NULL` | |
| `payment_status` | `payment_status` | `'pending'` | `NOT NULL` | |
| `payment_method` | `TEXT` | — | — | |
| `payment_reference` | `TEXT` | — | — | |
| `subtotal` | `NUMERIC(12,2)` | — | `NOT NULL` | |
| `discount_amount` | `NUMERIC(12,2)` | `0` | `NOT NULL` | |
| `shipping_amount` | `NUMERIC(12,2)` | `0` | `NOT NULL` | |
| `tax_amount` | `NUMERIC(12,2)` | `0` | `NOT NULL` | |
| `total_amount` | `NUMERIC(12,2)` | — | `NOT NULL` | |
| `currency` | `currency_code` | `'INR'` | `NOT NULL` | |
| `shipping_address` | `JSONB` | — | `NOT NULL` | Snapshot at purchase time |
| `tracking_number` | `TEXT` | — | — | |
| `estimated_delivery` | `DATE` | — | — | |

#### `order_items`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `PK` | |
| `order_id` | `UUID` | `FK → orders.id ON DELETE CASCADE` | |
| `product_id` | `UUID` | `FK → products.id ON DELETE RESTRICT` | |
| `product_title` | `TEXT` | `NOT NULL` | Snapshot — won't change if product edited |
| `product_image` | `TEXT` | — | Snapshot |
| `quantity` | `INTEGER` | `NOT NULL, CHECK > 0` | |
| `unit_price` | `NUMERIC(12,2)` | `NOT NULL` | Snapshot at purchase time |
| `total_price` | `NUMERIC(12,2)` | **GENERATED** | `quantity * unit_price` — stored |

---

#### `seller_analytics` *(pre-aggregated, append-by-day)*

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `PK` | |
| `seller_id` | `UUID` | `FK → sellers.id ON DELETE CASCADE` | |
| `date` | `DATE` | `NOT NULL` | |
| `product_views` | `INTEGER` | `NOT NULL DEFAULT 0` | |
| `search_clicks` | `INTEGER` | `NOT NULL DEFAULT 0` | |
| `profile_views` | `INTEGER` | `NOT NULL DEFAULT 0` | |
| `wishlist_adds` | `INTEGER` | `NOT NULL DEFAULT 0` | |
| `orders_count` | `INTEGER` | `NOT NULL DEFAULT 0` | |
| `revenue` | `NUMERIC(14,2)` | `NOT NULL DEFAULT 0` | |
| `(seller_id, date)` | — | `UNIQUE` | One row per seller per day |

> Populated nightly by the FastAPI Analytics Service cron job. Query this table for dashboard charts — never aggregate `orders` live.

---

## 5. Triggers

| Trigger | Table | Event | Action |
|---|---|---|---|
| `trg_*_updated_at` | All tables with `updated_at` | `BEFORE UPDATE` | Sets `updated_at = NOW()` |
| `trg_reviews_sync_rating` | `reviews` | `AFTER INSERT / UPDATE / DELETE` | Recomputes `products.rating` and `products.review_count` |
| `trg_products_sync_seller_count` | `products` | `AFTER INSERT / UPDATE(status) / DELETE` | Recomputes `sellers.product_count` |
| `trg_reviews_verified_purchase` | `reviews` | `BEFORE INSERT` | Sets `is_verified_purchase` by checking `orders` for a delivered order containing this product |

---

## 6. Indexes

### Critical Indexes

| Table | Index Type | Columns | Purpose |
|---|---|---|---|
| `sellers` | `GIST` | `location` | Geospatial nearby-seller queries |
| `products` | `GIN` | `tags` | Array containment `@>` queries |
| `products` | `GIN` | `specs` | JSONB containment queries |
| `products` | `GIN` | `to_tsvector(title, description, brand)` | Full-text fallback (Meilisearch primary) |
| `products` | `GIN` | `title gin_trgm_ops` | Trigram partial-name search |
| `products` | `BTREE (partial)` | `(category_id, price, rating) WHERE status='active'` | Primary listing query optimisation |
| `price_history` | `BTREE` | `(product_id, recorded_at DESC)` | Latest price lookup + chart data |
| `alerts` | `BTREE (partial)` | `(alert_type, is_active) WHERE is_active=TRUE` | Alert worker scan |
| `comparisons` | `GIN` | `product_ids` | "Which comparisons include product X?" |

---

## 7. Row-Level Security (RLS) — Supabase

RLS enabled on all user-scoped tables. The **service role** (used by Next.js Route Handlers and FastAPI) bypasses RLS entirely.

| Table | Policy |
|---|---|
| `users` | Users can only read/update their own row |
| `wishlists` | Owner only |
| `alerts` | Owner only |
| `orders` | User sees own orders; seller sees orders placed with them |
| `reviews` | Public read (non-hidden only); author manages their own row |
| `seller_analytics` | Seller sees only their own analytics |

---

## 8. Seed Data

10 root categories inserted on first deploy:

```
Electronics · Fashion · Home & Kitchen · Books
Beauty & Personal Care · Sports & Outdoors
Toys & Games · Food & Grocery · Automotive · Health & Wellness
```

---

## 9. Migration Workflow

```bash
# Development — push schema changes directly
npx drizzle-kit push

# Generate a migration file for production
npx drizzle-kit generate

# Apply migrations in CI/CD
npx drizzle-kit migrate
```

> **Rule:** All schema changes go through Drizzle ORM migrations. Never apply raw SQL manually to staging or production.
