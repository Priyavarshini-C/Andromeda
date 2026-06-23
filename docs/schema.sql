-- =============================================================================
-- ANDROMEDA — Complete Database Schema
-- PostgreSQL 16 (Supabase)
-- =============================================================================
-- Sections:
--   0.  Extensions
--   1.  Enums
--   2.  Auth Tables (NextAuth.js v5 / Auth.js adapter)
--   3.  Core Domain Tables
--        3a. categories
--        3b. sellers
--        3c. products
--        3d. reviews
--        3e. price_history
--        3f. wishlists
--        3g. alerts
--        3h. comparisons
--        3i. orders / order_items
--        3j. seller_analytics (aggregated)
-- 4.   Indexes
-- 5.   Row-Level Security (RLS) Policies (Supabase)
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- crypt(), gen_salt()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- trigram indexes for LIKE
CREATE EXTENSION IF NOT EXISTS "postgis";         -- geolocation (lat/lng queries)
CREATE EXTENSION IF NOT EXISTS "btree_gist";      -- GiST indexes on scalar types


-- ---------------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------------

CREATE TYPE user_role        AS ENUM ('user', 'seller', 'admin');
CREATE TYPE alert_type       AS ENUM ('price', 'stock');
CREATE TYPE order_status     AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status   AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE seller_status    AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE product_status   AS ENUM ('draft', 'active', 'hidden', 'removed');
CREATE TYPE currency_code    AS ENUM ('INR', 'USD', 'EUR');


-- ---------------------------------------------------------------------------
-- 2. AUTH TABLES  (NextAuth.js v5 / Auth.js — PostgreSQL Adapter)
--    Reference: https://authjs.dev/getting-started/adapters/pg
-- ---------------------------------------------------------------------------

-- 2.1 users
--     NextAuth creates this table; we extend it with domain columns.
CREATE TABLE users (
    -- NextAuth required columns
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT,
    email               TEXT            UNIQUE,
    email_verified      TIMESTAMPTZ,                -- populated when email link clicked
    image               TEXT,

    -- Andromeda domain extensions
    password_hash       TEXT,                       -- NULL for OAuth-only users
    role                user_role       NOT NULL DEFAULT 'user',
    phone               TEXT,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users                 IS 'Core user identity table. Compatible with NextAuth.js v5 adapter.';
COMMENT ON COLUMN users.password_hash  IS 'bcrypt hash; NULL for OAuth-only accounts.';
COMMENT ON COLUMN users.role           IS 'RBAC role enforced at middleware and route level.';

-- 2.2 accounts
--     OAuth provider accounts linked to a user (Google, GitHub, etc.)
CREATE TABLE accounts (
    id                          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                        TEXT    NOT NULL,               -- 'oauth' | 'email' | 'credentials'
    provider                    TEXT    NOT NULL,               -- 'google' | 'github' | 'credentials'
    provider_account_id         TEXT    NOT NULL,
    refresh_token               TEXT,
    access_token                TEXT,
    expires_at                  BIGINT,
    token_type                  TEXT,
    scope                       TEXT,
    id_token                    TEXT,
    session_state               TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT accounts_provider_account_unique UNIQUE (provider, provider_account_id)
);

COMMENT ON TABLE accounts IS 'OAuth provider links per user. One user may have multiple providers.';

-- 2.3 sessions
--     Server-side session store (used when strategy = "database")
CREATE TABLE sessions (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token   TEXT        NOT NULL UNIQUE,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires         TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sessions IS 'NextAuth.js database strategy sessions. Cleanup expired rows via cron.';

-- 2.4 verification_tokens
--     Magic-link / email verification tokens
CREATE TABLE verification_tokens (
    identifier  TEXT        NOT NULL,           -- email address
    token       TEXT        NOT NULL UNIQUE,
    expires     TIMESTAMPTZ NOT NULL,

    CONSTRAINT verification_tokens_pkey PRIMARY KEY (identifier, token)
);

COMMENT ON TABLE verification_tokens IS 'NextAuth.js email verification and magic-link tokens.';

-- 2.5 authenticators
--     WebAuthn / Passkey support (NextAuth.js v5 optional)
CREATE TABLE authenticators (
    credential_id           TEXT        PRIMARY KEY,
    user_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_account_id     TEXT        NOT NULL,
    credential_public_key   TEXT        NOT NULL,
    counter                 BIGINT      NOT NULL DEFAULT 0,
    credential_device_type  TEXT        NOT NULL,
    credential_backed_up    BOOLEAN     NOT NULL DEFAULT FALSE,
    transports              TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE authenticators IS 'WebAuthn/Passkey credentials. Optional NextAuth.js v5 feature.';


-- ---------------------------------------------------------------------------
-- 3. CORE DOMAIN TABLES
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 3a. CATEGORIES
-- ---------------------------------------------------------------------------

CREATE TABLE categories (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT        NOT NULL,
    slug        TEXT        NOT NULL UNIQUE,
    icon        TEXT,                               -- icon name or emoji, e.g. 'laptop'
    description TEXT,
    parent_id   UUID        REFERENCES categories(id) ON DELETE SET NULL,  -- self-join for sub-categories
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

COMMENT ON TABLE  categories            IS '2-level category hierarchy (parent=NULL means root category).';
COMMENT ON COLUMN categories.parent_id IS 'NULL = root category; non-NULL = sub-category.';


-- ---------------------------------------------------------------------------
-- 3b. SELLERS
-- ---------------------------------------------------------------------------

CREATE TABLE sellers (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Business identity
    business_name   TEXT            NOT NULL,
    slug            TEXT            NOT NULL UNIQUE,
    description     TEXT,
    logo_url        TEXT,
    banner_url      TEXT,
    website         TEXT,

    -- Location
    address_line1   TEXT,
    address_line2   TEXT,
    city            TEXT,
    state           TEXT,
    pincode         TEXT,
    country         TEXT            NOT NULL DEFAULT 'IN',
    location        GEOGRAPHY(POINT, 4326),         -- PostGIS point for geo queries

    -- Business details
    gstin           TEXT,                           -- GST Identification Number
    phone           TEXT,
    email           TEXT,

    -- Status & trust
    status          seller_status   NOT NULL DEFAULT 'pending',
    is_verified     BOOLEAN         NOT NULL DEFAULT FALSE,
    verified_at     TIMESTAMPTZ,
    verified_by     UUID            REFERENCES users(id) ON DELETE SET NULL,

    -- Aggregated ratings (denormalised for read performance)
    rating          NUMERIC(3, 2)   NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
    review_count    INTEGER         NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    product_count   INTEGER         NOT NULL DEFAULT 0 CHECK (product_count >= 0),

    -- Business hours (flexible JSON)
    business_hours  JSONB,
    -- e.g. {"mon": {"open": "09:00", "close": "18:00"}, "sun": null}

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT sellers_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

COMMENT ON TABLE  sellers          IS 'Registered sellers / businesses on Andromeda.';
COMMENT ON COLUMN sellers.location IS 'PostGIS GEOGRAPHY point. Used for nearby seller discovery.';
COMMENT ON COLUMN sellers.status   IS 'pending=awaiting admin review; active=live; suspended=temporary ban; rejected=permanently denied.';


-- ---------------------------------------------------------------------------
-- 3c. PRODUCTS
-- ---------------------------------------------------------------------------

CREATE TABLE products (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id       UUID            NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    category_id     UUID            NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

    -- Content
    title           TEXT            NOT NULL,
    slug            TEXT            NOT NULL UNIQUE,
    description     TEXT,
    short_desc      TEXT,           -- max ~200 chars for card display

    -- Media
    images          TEXT[]          NOT NULL DEFAULT '{}',   -- ordered array of Cloudinary URLs
    thumbnail_url   TEXT,           -- first image or separately uploaded thumbnail

    -- Pricing
    price           NUMERIC(12, 2)  NOT NULL CHECK (price >= 0),
    original_price  NUMERIC(12, 2)  CHECK (original_price >= 0),  -- MRP / strike-through price
    currency        currency_code   NOT NULL DEFAULT 'INR',
    discount_pct    NUMERIC(5, 2)   GENERATED ALWAYS AS (
                        CASE
                            WHEN original_price IS NOT NULL AND original_price > 0
                            THEN ROUND(((original_price - price) / original_price) * 100, 2)
                            ELSE 0
                        END
                    ) STORED,

    -- Inventory
    stock           INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku             TEXT,

    -- Flexible specifications (e.g. {"RAM": "16GB", "Storage": "512GB"})
    specs           JSONB           NOT NULL DEFAULT '{}',

    -- Tagging & search
    tags            TEXT[]          NOT NULL DEFAULT '{}',
    brand           TEXT,

    -- Status & curation
    status          product_status  NOT NULL DEFAULT 'draft',
    is_featured     BOOLEAN         NOT NULL DEFAULT FALSE,

    -- Aggregated ratings (denormalised for read performance)
    rating          NUMERIC(3, 2)   NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
    review_count    INTEGER         NOT NULL DEFAULT 0 CHECK (review_count >= 0),

    -- SEO
    meta_title      TEXT,
    meta_description TEXT,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT products_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

COMMENT ON TABLE  products               IS 'Product catalogue. Owned by sellers.';
COMMENT ON COLUMN products.discount_pct  IS 'Auto-computed from original_price vs price. Stored column.';
COMMENT ON COLUMN products.specs         IS 'Flexible JSONB for category-specific specifications.';
COMMENT ON COLUMN products.images        IS 'Ordered array of Cloudinary/S3 URLs. First element = primary image.';


-- ---------------------------------------------------------------------------
-- 3d. REVIEWS
-- ---------------------------------------------------------------------------

CREATE TABLE reviews (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    rating              SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title               TEXT,
    content             TEXT        NOT NULL,

    -- Trust signals
    is_verified_purchase BOOLEAN    NOT NULL DEFAULT FALSE,
    helpful_count       INTEGER     NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
    unhelpful_count     INTEGER     NOT NULL DEFAULT 0 CHECK (unhelpful_count >= 0),

    -- Moderation
    is_flagged          BOOLEAN     NOT NULL DEFAULT FALSE,
    flag_reason         TEXT,
    is_hidden           BOOLEAN     NOT NULL DEFAULT FALSE,

    -- NLP/ML fraud detection score (0 = clean, 1 = very suspicious)
    fraud_score         NUMERIC(4, 3) CHECK (fraud_score BETWEEN 0 AND 1),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One review per user per product
    CONSTRAINT reviews_one_per_user_product UNIQUE (product_id, user_id)
);

COMMENT ON TABLE  reviews                    IS 'User reviews for products.';
COMMENT ON COLUMN reviews.is_verified_purchase IS 'Set by system when user has a completed order containing this product.';
COMMENT ON COLUMN reviews.fraud_score        IS 'ML-computed suspicion score injected by the Recommendations Service.';

-- Review helpful votes (many-to-many junction)
CREATE TABLE review_votes (
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_id   UUID        NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    is_helpful  BOOLEAN     NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, review_id)
);


-- ---------------------------------------------------------------------------
-- 3e. PRICE HISTORY  (append-only time-series)
-- ---------------------------------------------------------------------------

CREATE TABLE price_history (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID            NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id       UUID            NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,

    price           NUMERIC(12, 2)  NOT NULL,
    currency        currency_code   NOT NULL DEFAULT 'INR',

    -- Source of this price record
    source          TEXT            NOT NULL DEFAULT 'manual',  -- 'manual' | 'scraper' | 'api'

    recorded_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()

    -- NOTE: No updated_at — this table is append-only.
    -- Partitioned by range on recorded_at for scalability (see partitioning note below).
);

COMMENT ON TABLE price_history IS 'Append-only price time-series. Never UPDATE or DELETE rows. Used for price history charts and drop alerts.';


-- ---------------------------------------------------------------------------
-- 3f. WISHLISTS
-- ---------------------------------------------------------------------------

CREATE TABLE wishlists (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id          UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    collection_name     TEXT        NOT NULL DEFAULT 'My Wishlist',
    note                TEXT,
    added_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- A product can only be saved once per user per collection
    CONSTRAINT wishlists_unique_per_collection UNIQUE (user_id, product_id, collection_name)
);

COMMENT ON TABLE wishlists IS 'User saved products. Supports named collections (multiple wishlists per user).';


-- ---------------------------------------------------------------------------
-- 3g. ALERTS  (price drop & stock restoration)
-- ---------------------------------------------------------------------------

CREATE TABLE alerts (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id          UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    alert_type          alert_type  NOT NULL,
    target_price        NUMERIC(12, 2),     -- only relevant for alert_type = 'price'

    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    trigger_count       INTEGER     NOT NULL DEFAULT 0,
    last_triggered_at   TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One alert of each type per user per product
    CONSTRAINT alerts_unique_per_type UNIQUE (user_id, product_id, alert_type),
    CONSTRAINT alerts_price_requires_target CHECK (
        alert_type != 'price' OR target_price IS NOT NULL
    )
);

COMMENT ON TABLE  alerts              IS 'Price drop and stock restoration alerts.';
COMMENT ON COLUMN alerts.target_price IS 'Alert fires when product price drops AT or BELOW this value.';


-- ---------------------------------------------------------------------------
-- 3h. COMPARISONS  (session-based, user optional)
-- ---------------------------------------------------------------------------

CREATE TABLE comparisons (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      TEXT    NOT NULL,                   -- anonymous browser session ID
    user_id         UUID    REFERENCES users(id) ON DELETE SET NULL,  -- NULL = anonymous
    product_ids     UUID[]  NOT NULL,                   -- 2 to 4 product IDs

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT comparisons_min_products CHECK (array_length(product_ids, 1) >= 2),
    CONSTRAINT comparisons_max_products CHECK (array_length(product_ids, 1) <= 4)
);

COMMENT ON TABLE  comparisons             IS 'Recorded comparison sessions. Used for analytics and to restore compare state.';
COMMENT ON COLUMN comparisons.product_ids IS 'PostgreSQL UUID array; 2–4 product IDs.';


-- ---------------------------------------------------------------------------
-- 3i. ORDERS & ORDER_ITEMS
-- ---------------------------------------------------------------------------

CREATE TABLE orders (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Denormalised snapshot at time of purchase (seller may change details later)
    seller_id           UUID            NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,

    status              order_status    NOT NULL DEFAULT 'pending',
    payment_status      payment_status  NOT NULL DEFAULT 'pending',
    payment_method      TEXT,
    payment_reference   TEXT,

    -- Financials
    subtotal            NUMERIC(12, 2)  NOT NULL,
    discount_amount     NUMERIC(12, 2)  NOT NULL DEFAULT 0,
    shipping_amount     NUMERIC(12, 2)  NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(12, 2)  NOT NULL DEFAULT 0,
    total_amount        NUMERIC(12, 2)  NOT NULL,
    currency            currency_code   NOT NULL DEFAULT 'INR',

    -- Shipping
    shipping_address    JSONB           NOT NULL,
    -- e.g. {"name": "Priya", "line1": "...", "city": "...", "pincode": "...", "phone": "..."}
    tracking_number     TEXT,
    estimated_delivery  DATE,

    notes               TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Order header. Each order belongs to a single seller (per-seller checkout model).';

CREATE TABLE order_items (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Snapshot of product at time of purchase
    product_id          UUID            NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_title       TEXT            NOT NULL,
    product_image       TEXT,
    product_sku         TEXT,

    quantity            INTEGER         NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(12, 2)  NOT NULL,
    total_price         NUMERIC(12, 2)  GENERATED ALWAYS AS (quantity * unit_price) STORED,

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE order_items IS 'Line items for each order. Prices are snapshotted at purchase time.';


-- ---------------------------------------------------------------------------
-- 3j. SELLER_ANALYTICS  (pre-aggregated daily metrics)
-- ---------------------------------------------------------------------------

CREATE TABLE seller_analytics (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id       UUID    NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    date            DATE    NOT NULL,

    -- Traffic
    product_views   INTEGER NOT NULL DEFAULT 0,
    search_clicks   INTEGER NOT NULL DEFAULT 0,
    profile_views   INTEGER NOT NULL DEFAULT 0,

    -- Conversions
    wishlist_adds   INTEGER NOT NULL DEFAULT 0,
    orders_count    INTEGER NOT NULL DEFAULT 0,
    revenue         NUMERIC(14, 2) NOT NULL DEFAULT 0,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT seller_analytics_unique_day UNIQUE (seller_id, date)
);

COMMENT ON TABLE seller_analytics IS 'Pre-aggregated daily metrics per seller. Populated by FastAPI Analytics Service nightly cron.';


-- =============================================================================
-- 4. INDEXES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Auth tables
-- ---------------------------------------------------------------------------
CREATE INDEX idx_accounts_user_id              ON accounts(user_id);
CREATE INDEX idx_sessions_user_id              ON sessions(user_id);
CREATE INDEX idx_sessions_token                ON sessions(session_token);
CREATE INDEX idx_authenticators_user_id        ON authenticators(user_id);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
CREATE INDEX idx_categories_parent_id          ON categories(parent_id);
CREATE INDEX idx_categories_slug               ON categories(slug);
CREATE INDEX idx_categories_active             ON categories(is_active) WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- sellers
-- ---------------------------------------------------------------------------
CREATE INDEX idx_sellers_user_id               ON sellers(user_id);
CREATE INDEX idx_sellers_slug                  ON sellers(slug);
CREATE INDEX idx_sellers_status                ON sellers(status);
CREATE INDEX idx_sellers_verified              ON sellers(is_verified);
-- Geospatial index for nearby discovery
CREATE INDEX idx_sellers_location_geo          ON sellers USING GIST (location);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
CREATE INDEX idx_products_seller_id            ON products(seller_id);
CREATE INDEX idx_products_category_id          ON products(category_id);
CREATE INDEX idx_products_slug                 ON products(slug);
CREATE INDEX idx_products_status               ON products(status);
CREATE INDEX idx_products_featured             ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_price                ON products(price);
CREATE INDEX idx_products_rating               ON products(rating DESC);
CREATE INDEX idx_products_brand                ON products(brand);
-- Partial index for active products (most common query filter)
CREATE INDEX idx_products_active               ON products(category_id, price, rating)
    WHERE status = 'active';
-- GIN index on tags for array containment queries
CREATE INDEX idx_products_tags                 ON products USING GIN (tags);
-- GIN index on specs for JSONB containment queries
CREATE INDEX idx_products_specs                ON products USING GIN (specs);
-- Full-text search fallback (Meilisearch is primary)
CREATE INDEX idx_products_fts                  ON products USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(brand, ''))
);
-- Trigram index for partial name searches
CREATE INDEX idx_products_title_trgm           ON products USING GIN (title gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
CREATE INDEX idx_reviews_product_id            ON reviews(product_id);
CREATE INDEX idx_reviews_user_id               ON reviews(user_id);
CREATE INDEX idx_reviews_rating                ON reviews(product_id, rating);
CREATE INDEX idx_reviews_verified              ON reviews(product_id, is_verified_purchase)
    WHERE is_verified_purchase = TRUE;
CREATE INDEX idx_reviews_flagged               ON reviews(is_flagged) WHERE is_flagged = TRUE;

-- ---------------------------------------------------------------------------
-- price_history
-- ---------------------------------------------------------------------------
-- Primary query pattern: latest price for a product (DESC recorded_at)
CREATE INDEX idx_price_history_product_time    ON price_history(product_id, recorded_at DESC);
-- For alert worker: find products that changed price in last N minutes
CREATE INDEX idx_price_history_recent          ON price_history(recorded_at DESC);

-- ---------------------------------------------------------------------------
-- wishlists
-- ---------------------------------------------------------------------------
CREATE INDEX idx_wishlists_user_id             ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id          ON wishlists(product_id);
CREATE INDEX idx_wishlists_collection          ON wishlists(user_id, collection_name);

-- ---------------------------------------------------------------------------
-- alerts
-- ---------------------------------------------------------------------------
-- Alert worker query: find all active alerts
CREATE INDEX idx_alerts_active                 ON alerts(alert_type, is_active)
    WHERE is_active = TRUE;
CREATE INDEX idx_alerts_user_id                ON alerts(user_id);
CREATE INDEX idx_alerts_product_id             ON alerts(product_id);

-- ---------------------------------------------------------------------------
-- comparisons
-- ---------------------------------------------------------------------------
CREATE INDEX idx_comparisons_session           ON comparisons(session_id);
CREATE INDEX idx_comparisons_user_id           ON comparisons(user_id);
-- GIN index to query "which comparisons include product X?"
CREATE INDEX idx_comparisons_product_ids       ON comparisons USING GIN (product_ids);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
CREATE INDEX idx_orders_user_id                ON orders(user_id);
CREATE INDEX idx_orders_seller_id              ON orders(seller_id);
CREATE INDEX idx_orders_status                 ON orders(status);
CREATE INDEX idx_orders_created_at             ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id          ON order_items(order_id);
CREATE INDEX idx_order_items_product_id        ON order_items(product_id);

-- ---------------------------------------------------------------------------
-- seller_analytics
-- ---------------------------------------------------------------------------
CREATE INDEX idx_seller_analytics_seller_date  ON seller_analytics(seller_id, date DESC);


-- =============================================================================
-- 5. TRIGGERS  (auto-update updated_at, maintain denormalised counts)
-- =============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'accounts', 'sessions',
        'sellers', 'categories', 'products', 'reviews',
        'wishlists', 'alerts', 'orders', 'seller_analytics'
    ] LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
            t, t
        );
    END LOOP;
END;
$$;


-- ---------------------------------------------------------------------------
-- 5a. Trigger: maintain products.review_count and products.rating
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE products
    SET
        review_count = (
            SELECT COUNT(*) FROM reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
              AND is_hidden = FALSE
        ),
        rating = COALESCE((
            SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
              AND is_hidden = FALSE
        ), 0)
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reviews_sync_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION sync_product_rating();


-- ---------------------------------------------------------------------------
-- 5b. Trigger: maintain sellers.product_count
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_seller_product_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    target_seller_id UUID;
BEGIN
    target_seller_id := COALESCE(NEW.seller_id, OLD.seller_id);
    UPDATE sellers
    SET product_count = (
        SELECT COUNT(*) FROM products
        WHERE seller_id = target_seller_id AND status = 'active'
    )
    WHERE id = target_seller_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_sync_seller_count
AFTER INSERT OR UPDATE OF status OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION sync_seller_product_count();


-- ---------------------------------------------------------------------------
-- 5c. Trigger: set is_verified_purchase on review insert
--     Checks if the reviewer has a delivered order containing this product
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_verified_purchase()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.is_verified_purchase := EXISTS (
        SELECT 1
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id    = NEW.user_id
          AND oi.product_id = NEW.product_id
          AND o.status      = 'delivered'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reviews_verified_purchase
BEFORE INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION set_verified_purchase();


-- =============================================================================
-- 6. ROW-LEVEL SECURITY (RLS)  — Supabase
-- =============================================================================
-- Enable RLS on tables that have user-scoped data.
-- Service role (Next.js Route Handlers / FastAPI) bypasses RLS.

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists           ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_analytics    ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own profile
CREATE POLICY users_self_access ON users
    USING (id = auth.uid());

-- Wishlists: user owns their own rows
CREATE POLICY wishlists_owner ON wishlists
    USING (user_id = auth.uid());

-- Alerts: user owns their own rows
CREATE POLICY alerts_owner ON alerts
    USING (user_id = auth.uid());

-- Orders: users see only their own orders; sellers see orders placed with them
CREATE POLICY orders_user_view ON orders
    USING (
        user_id = auth.uid()
        OR seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
    );

-- Reviews: everyone reads non-hidden reviews; authors manage their own
CREATE POLICY reviews_public_read ON reviews
    FOR SELECT USING (is_hidden = FALSE);

CREATE POLICY reviews_author_write ON reviews
    FOR ALL USING (user_id = auth.uid());

-- Seller analytics: sellers see only their own
CREATE POLICY seller_analytics_owner ON seller_analytics
    USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));


-- =============================================================================
-- 7. SEED: ROOT CATEGORIES
-- =============================================================================

INSERT INTO categories (id, name, slug, icon, sort_order) VALUES
    (uuid_generate_v4(), 'Electronics',         'electronics',          '💻', 1),
    (uuid_generate_v4(), 'Fashion',              'fashion',              '👗', 2),
    (uuid_generate_v4(), 'Home & Kitchen',       'home-kitchen',         '🏠', 3),
    (uuid_generate_v4(), 'Books',                'books',                '📚', 4),
    (uuid_generate_v4(), 'Beauty & Personal Care','beauty',              '💄', 5),
    (uuid_generate_v4(), 'Sports & Outdoors',    'sports',               '⚽', 6),
    (uuid_generate_v4(), 'Toys & Games',         'toys-games',           '🧸', 7),
    (uuid_generate_v4(), 'Food & Grocery',       'food-grocery',         '🛒', 8),
    (uuid_generate_v4(), 'Automotive',           'automotive',           '🚗', 9),
    (uuid_generate_v4(), 'Health & Wellness',    'health-wellness',      '💊', 10);


-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. price_history PARTITIONING (recommended at scale):
--    Use PostgreSQL declarative partitioning by range on recorded_at (monthly).
--    CREATE TABLE price_history PARTITION BY RANGE (recorded_at);
--    Manage partition creation via pg_partman or a scheduled job.
--
-- 2. SEARCH SYNC:
--    Meilisearch is the primary search engine. A FastAPI webhook listener
--    watches for INSERT/UPDATE on `products` and syncs to the search index.
--    Do NOT query products table directly for search — use Meilisearch.
--
-- 3. ORM:
--    Schema is managed via Drizzle ORM migrations (drizzle-kit).
--    This raw SQL is the canonical reference; do not apply manually.
--
-- 4. MIGRATIONS:
--    Run via: npx drizzle-kit push  (development)
--             npx drizzle-kit migrate (production CI/CD)
-- =============================================================================
