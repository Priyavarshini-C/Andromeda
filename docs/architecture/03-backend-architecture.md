# Andromeda — Backend Architecture

> **Version:** 1.0 | **Status:** Draft | **Date:** June 2026

---

## 1. Overview

The backend is composed of two layers:

1. **Next.js Route Handlers** — the Backend-for-Frontend (BFF). Runs on Vercel's serverless/edge runtime. Handles auth, CRUD operations, and orchestrates calls to the database and microservices.

2. **FastAPI Microservices** — containerised Python services on Railway. Handle compute-intensive operations that would bloat the Next.js bundle or exceed serverless time limits: search indexing, ML recommendations, analytics aggregation, and notification dispatch.

```
Next.js Route Handlers (Vercel)
        │
        ├── Direct to PostgreSQL (Drizzle ORM)     ← for CRUD
        ├── Direct to Redis (Upstash)               ← for cache / sessions
        └── HTTP to FastAPI Services (service token) ← for search / ML / analytics

FastAPI Services (Railway)
        │
        ├── Search Service      → Meilisearch + PostgreSQL
        ├── Recommendations     → PostgreSQL + ML model
        ├── Analytics           → PostgreSQL → seller_analytics (aggregation)
        └── Notifications       → PostgreSQL → Resend (email)
```

---

## 2. Next.js Route Handlers (BFF)

All routes live under `src/app/api/`. Route Handlers are Next.js serverless functions — stateless, edge-compatible, and protected by middleware.

### 2.1 Route Map

```
src/app/api/
│
├── auth/
│   └── [...nextauth]/route.ts         # NextAuth.js v5 catch-all handler
│
├── products/
│   ├── route.ts                        # GET (list) · POST (seller creates)
│   ├── [id]/
│   │   ├── route.ts                    # GET (detail) · PUT · DELETE
│   │   └── related/route.ts            # GET related products
│
├── search/
│   ├── route.ts                        # GET — delegates to FastAPI Search
│   └── suggest/route.ts               # GET — autocomplete suggestions
│
├── categories/
│   ├── route.ts                        # GET all
│   └── [slug]/route.ts                # GET detail + subcategories
│
├── compare/
│   └── route.ts                        # POST — fetch comparison payload
│
├── sellers/
│   ├── route.ts                        # GET list (supports ?near=lat,lng)
│   └── [slug]/route.ts                # GET seller profile + products
│
├── reviews/
│   └── route.ts                        # POST submit review
│
├── user/
│   ├── wishlist/
│   │   ├── route.ts                    # GET · POST
│   │   └── [id]/route.ts              # DELETE
│   ├── alerts/
│   │   ├── route.ts                    # GET · POST
│   │   └── [id]/route.ts              # PUT (toggle) · DELETE
│   └── profile/
│       └── route.ts                    # GET · PUT
│
├── seller/
│   ├── products/
│   │   ├── route.ts                    # GET · POST
│   │   └── [id]/route.ts              # PUT · DELETE
│   ├── dashboard/route.ts             # GET analytics summary
│   └── onboarding/route.ts            # POST complete registration
│
└── admin/
    ├── dashboard/route.ts             # GET platform KPIs
    ├── sellers/
    │   ├── route.ts                    # GET all + filter
    │   └── [id]/route.ts              # PUT (approve/reject/suspend)
    ├── products/
    │   ├── route.ts                    # GET all + moderation
    │   └── [id]/route.ts              # PUT (feature/hide/remove)
    ├── users/route.ts                 # GET all users
    └── reviews/
        ├── route.ts                    # GET flagged queue
        └── [id]/route.ts              # PUT (approve/remove)
```

### 2.2 Route Handler Pattern

Every Route Handler follows this structure:

```typescript
// Pattern: auth → validate input → cache check → DB/service → cache set → respond

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // 1. Auth (for protected routes)
  const session = await auth();
  if (!session) return unauthorized();

  // 2. Input validation (Zod)
  const parsed = QuerySchema.safeParse(/* params / searchParams */);
  if (!parsed.success) return validationError(parsed.error);

  // 3. Cache check (Redis)
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  // 4. Database query (Drizzle ORM)
  const data = await db.query.products.findMany({ where: ... });

  // 5. Cache set
  await redis.setex(cacheKey, 60, data);

  // 6. Return
  return NextResponse.json({ data });
}
```

### 2.3 Middleware

`src/middleware.ts` runs at the edge before any Route Handler or page:

```
Request
   │
   ▼
middleware.ts
   ├── CORS headers (restrict to andromeda.app)
   ├── Rate limiting (Redis counters per IP)
   ├── Session check (NextAuth.js auth())
   │     └── Unauthenticated → redirect to /login (for protected routes)
   ├── RBAC role check
   │     └── Insufficient role → 403
   └── Pass to Route Handler / Page
```

**Protected route matchers:**

| Pattern | Required Role |
|---|---|
| `/api/user/*` | `user` (any authenticated) |
| `/api/seller/*` | `seller` |
| `/api/admin/*` | `admin` |
| `/(dashboard)/*` | `user` |
| `/(seller)/*` | `seller` |
| `/(admin)/*` | `admin` |

---

## 3. Server Actions

All form mutations use Next.js Server Actions (`'use server'`). They never expose API endpoints and are validated with Zod before any DB write.

| Action File | Actions | Called From |
|---|---|---|
| `actions/auth.ts` | `login`, `register`, `logout` | Auth pages |
| `actions/reviews.ts` | `submitReview`, `voteHelpful`, `flagReview` | Product detail page |
| `actions/wishlist.ts` | `addToWishlist`, `removeFromWishlist`, `createCollection` | ProductCard, Wishlist page |
| `actions/alerts.ts` | `createAlert`, `toggleAlert`, `deleteAlert` | AlertModal |
| `actions/seller.ts` | `completeOnboarding`, `updateSellerProfile` | Seller onboarding |
| `actions/product.ts` | `createProduct`, `updateProduct`, `deleteProduct`, `bulkUpload` | Seller dashboard |
| `actions/admin.ts` | `approveSeller`, `rejectSeller`, `suspendSeller`, `moderateReview`, `featureProduct` | Admin panel |
| `actions/compare.ts` | `saveComparison` | Compare page |

**Server Action pattern:**

```typescript
'use server';

export async function submitReview(formData: FormData) {
  // 1. Auth
  const session = await auth();
  if (!session) throw new Error('UNAUTHORIZED');

  // 2. Validate
  const input = ReviewSchema.parse(Object.fromEntries(formData));

  // 3. Write to DB
  await db.insert(reviews).values({ ...input, userId: session.user.id });

  // 4. Invalidate cache
  revalidateTag('products');

  // 5. Trigger Meilisearch sync (via FastAPI webhook)
  await notifySearchService(input.productId);
}
```

---

## 4. FastAPI Microservices

### 4.1 Project Structure

```
fastapi/
│
├── search/
│   ├── main.py              # FastAPI app, /search, /suggest endpoints
│   ├── indexer.py           # Webhook listener: DB change → Meilisearch sync
│   ├── schemas.py           # Pydantic request/response models
│   └── Dockerfile
│
├── recommendations/
│   ├── main.py              # /recommend/user/{id}, /recommend/similar/{id}
│   ├── engine.py            # Collaborative filtering + content-based model
│   ├── schemas.py
│   └── Dockerfile
│
├── analytics/
│   ├── main.py              # /analytics/seller, /analytics/platform
│   ├── aggregator.py        # Nightly cron: aggregate orders → seller_analytics
│   ├── schemas.py
│   └── Dockerfile
│
├── notifications/
│   ├── main.py              # /notify/price-drop, /notify/stock-alert
│   ├── worker.py            # APScheduler: runs price check every 5 minutes
│   ├── mailer.py            # Resend email dispatch
│   ├── schemas.py
│   └── Dockerfile
│
└── shared/
    ├── auth.py              # JWT verification (shared service token)
    ├── db.py                # Async SQLAlchemy session factory
    ├── models.py            # SQLAlchemy ORM models (mirrors Drizzle schema)
    ├── cache.py             # Redis client wrapper
    └── config.py            # Settings (pydantic-settings)
```

### 4.2 Search Service

**Base URL:** `http://search-service:8001` (internal Railway service URL)

| Endpoint | Method | Description |
|---|---|---|
| `/search` | `GET` | Meilisearch query with enrichment (seller info, discount badge) |
| `/suggest` | `GET` | Autocomplete: typo-tolerant suggestions, limit 6 |
| `/index/sync` | `POST` | Webhook from Next.js: sync product to Meilisearch index |
| `/index/rebuild` | `POST` | Admin: full index rebuild from PostgreSQL |

**Meilisearch index configuration:**

```python
SEARCH_INDEX_SETTINGS = {
    "searchableAttributes": ["title", "description", "brand", "tags"],
    "filterableAttributes": ["category_id", "seller_id", "price", "rating", "status", "brand", "tags"],
    "sortableAttributes": ["price", "rating", "created_at"],
    "typoTolerance": {"enabled": True, "minWordSizeForTypos": {"oneTypo": 4, "twoTypos": 8}},
    "pagination": {"maxTotalHits": 1000},
}
```

### 4.3 Recommendations Service

**Base URL:** `http://recommendations-service:8002`

| Endpoint | Method | Description |
|---|---|---|
| `/recommend/user/{user_id}` | `GET` | Personalised feed (collaborative filtering) |
| `/recommend/similar/{product_id}` | `GET` | Content-based similar products |
| `/recommend/trending` | `GET` | Platform-wide trending (no auth needed) |
| `/recommend/train` | `POST` | Admin: trigger model retraining |

**Algorithm phases:**
- **Phase 2:** Content-based similarity (product specs + category + tags)
- **Phase 3:** Collaborative filtering (user behaviour matrix)
- **Phase 5:** Hybrid model + A/B test framework

### 4.4 Analytics Service

**Base URL:** `http://analytics-service:8003`

| Endpoint | Method | Description |
|---|---|---|
| `/analytics/seller/{seller_id}` | `GET` | Seller metrics for `period` (7d/30d/90d) |
| `/analytics/platform` | `GET` | Admin: platform-wide KPIs |
| `/analytics/aggregate` | `POST` | Internal: nightly aggregation job trigger |

**Nightly cron job** (runs at 00:30 IST):
1. Aggregate yesterday's `orders` and `order_items` per seller
2. Count product views, search clicks, profile views from event log
3. Upsert into `seller_analytics`

### 4.5 Notifications Service

**Base URL:** `http://notifications-service:8004`

| Endpoint | Method | Description |
|---|---|---|
| `/notify/price-drop` | `POST` | Run price drop check for all active alerts |
| `/notify/stock-alert` | `POST` | Run stock restoration check |
| `/notify/send` | `POST` | Send a single notification (email or in-app) |

**Price drop worker** (APScheduler, every 5 minutes):

```python
1. SELECT alerts WHERE alert_type = 'price' AND is_active = TRUE
2. For each alert:
   a. Get latest price from price_history for (product_id, seller_id)
   b. Compare with alert.target_price
   c. If current_price <= target_price:
      - Send email via Resend
      - Create in-app notification
      - UPDATE alerts SET last_triggered_at = NOW(), trigger_count = trigger_count + 1
```

---

## 5. Background Jobs Reference

| Job | Schedule | Service | Description |
|---|---|---|---|
| Price drop detector | Every 5 min | Notifications | Checks all active price alerts |
| Stock alert detector | Every 15 min | Notifications | Checks out-of-stock products that are now in stock |
| Meilisearch sync | On product write (webhook) | Search | Keeps index current with DB |
| Analytics aggregation | Daily 00:30 IST | Analytics | Computes seller daily metrics |
| Fake review detection | On review insert | Recommendations | NLP heuristics + velocity check |
| Session cleanup | Daily | Next.js (DB cron) | Purge expired `sessions` rows |
| Price history archive | Monthly | Analytics | Partition and archive old price_history rows |

---

## 6. Inter-Service Communication

### Next.js → FastAPI

All calls from Route Handlers to FastAPI services use:
- **Internal Railway service URLs** (not public internet)
- **Service authentication token** (`X-Service-Token: <secret>`) verified by `shared/auth.py`
- **Async fetch** with timeout (5s default, 2s for search/suggest)

```typescript
// lib/api/search.ts
export async function searchProducts(query: SearchQuery) {
  const res = await fetch(`${env.SEARCH_SERVICE_URL}/search?${qs}`, {
    headers: { 'X-Service-Token': env.SERVICE_TOKEN },
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new ServiceError('search', res.status);
  return res.json() as Promise<SearchResponse>;
}
```

### FastAPI → PostgreSQL

All FastAPI services share the same Supabase PostgreSQL instance:
- **Async SQLAlchemy** with connection pooling (PgBouncer via Supabase)
- **Read replicas** in Phase 3 for analytics queries
- **SQLAlchemy models** in `shared/models.py` mirror the Drizzle schema — kept in sync manually

---

## 7. Error Handling

### Route Handler errors

All errors returned as:
```json
{ "error": { "code": "NOT_FOUND", "message": "Product not found", "details": null } }
```

Standard error codes: `UNAUTHORIZED` (401) · `FORBIDDEN` (403) · `NOT_FOUND` (404) · `VALIDATION_ERROR` (422) · `RATE_LIMITED` (429) · `SERVER_ERROR` (500)

### Circuit breaker (FastAPI calls)

If a microservice is unavailable, Route Handlers **degrade gracefully**:
- Search unavailable → fall back to PostgreSQL full-text search
- Recommendations unavailable → serve trending products
- Analytics unavailable → return cached snapshot or empty state

Sentry captures all microservice failures with full context.

---

## 8. ORM: Drizzle ORM

Drizzle ORM is the chosen ORM for type-safe database access from Next.js.

### Why Drizzle over Prisma

| | Drizzle | Prisma |
|---|---|---|
| Bundle size | ~40 KB | ~500 KB (heavy for edge) |
| Supabase RLS | Natively compatible | Requires workarounds |
| Type inference | SQL-like, precise | Abstracted, occasional drift |
| Migration control | Full SQL control | Opinionated migration engine |
| Performance | No runtime overhead | Prisma Client engine overhead |

### Connection setup

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

### Schema location

```
src/lib/db/
  schema/
    auth.ts          # users, accounts, sessions, verification_tokens, authenticators
    categories.ts    # categories
    sellers.ts       # sellers
    products.ts      # products
    reviews.ts       # reviews, review_votes
    commerce.ts      # wishlists, alerts, comparisons, orders, order_items
    analytics.ts     # seller_analytics, price_history
  index.ts           # db singleton export
  migrations/        # generated migration SQL files
```
