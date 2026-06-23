# Andromeda — API Specification

> **Version:** 1.0 | **Status:** Draft | **Date:** June 2026
> **Base URL (Production):** `https://andromeda.app/api`
> **Base URL (Dev):** `http://localhost:3000/api`

---

## 1. Conventions

### Response Envelope

All endpoints return a consistent JSON envelope:

```typescript
// Success
{
  "data": T,
  "meta"?: {
    "page": number,
    "pageSize": number,
    "total": number,
    "totalPages": number
  }
}

// Error
{
  "error": {
    "code": ErrorCode,
    "message": string,
    "details"?: Record<string, string[]>  // Zod field errors
  }
}
```

### Error Codes

| Code | HTTP Status | When |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid auth token/session |
| `FORBIDDEN` | 403 | Authenticated but insufficient role |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate (e.g., review already exists) |
| `VALIDATION_ERROR` | 422 | Zod schema failed; `details` contains field errors |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Unexpected internal error |

### Authentication

Protected endpoints require a valid NextAuth.js session. Attach the session cookie automatically (same-origin browser requests). For API testing / server-to-server calls, pass the session token:

```
Cookie: next-auth.session-token=<token>
```

### Pagination

All list endpoints support:

| Param | Default | Max | Description |
|---|---|---|---|
| `page` | `1` | — | Page number (1-indexed) |
| `pageSize` | `20` | `100` | Items per page |

### Rate Limits

| Endpoint Group | Limit | Window |
|---|---|---|
| `GET /api/search` | 100 req/min | Per IP |
| `GET /api/products` | 200 req/min | Per IP |
| `POST /api/reviews` | 5 req/min | Per authenticated user |
| `POST /api/user/*` (writes) | 20 req/min | Per authenticated user |
| `POST /api/seller/*` (writes) | 20 req/min | Per seller session |
| `GET /api/admin/*` | 50 req/min | Per admin session |

---

## 2. Public Endpoints

### 2.1 Products

#### `GET /api/products`

Paginated product listing with filtering and sorting.

**Auth:** None required

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | `number` | Page number (default: 1) |
| `pageSize` | `number` | Items per page (default: 20, max: 100) |
| `categoryId` | `string (UUID)` | Filter by category |
| `sellerId` | `string (UUID)` | Filter by seller |
| `brand` | `string` | Filter by brand name |
| `minPrice` | `number` | Minimum price in INR |
| `maxPrice` | `number` | Maximum price in INR |
| `minRating` | `number (1-5)` | Minimum average rating |
| `inStock` | `boolean` | Only show in-stock items |
| `isFeatured` | `boolean` | Only show featured products |
| `tags` | `string[]` | Filter by tag(s) — comma-separated |
| `sortBy` | `'price' \| 'rating' \| 'created_at' \| 'discount_pct'` | Sort field (default: `created_at`) |
| `order` | `'asc' \| 'desc'` | Sort order (default: `desc`) |

**Response:**

```typescript
{
  data: ProductCard[],
  meta: PaginationMeta
}

interface ProductCard {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  price: number;
  original_price: number | null;
  discount_pct: number;
  currency: 'INR' | 'USD' | 'EUR';
  stock: number;
  rating: number;
  review_count: number;
  brand: string | null;
  is_featured: boolean;
  seller: {
    id: string;
    business_name: string;
    slug: string;
    is_verified: boolean;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}
```

---

#### `GET /api/products/[id]`

Full product detail including price history.

**Auth:** None required

**Response:**

```typescript
{
  data: ProductDetail
}

interface ProductDetail extends ProductCard {
  description: string;
  short_desc: string;
  images: string[];
  specs: Record<string, string>;
  tags: string[];
  sku: string | null;
  meta_title: string | null;
  meta_description: string | null;
  price_history: PriceHistoryPoint[];  // last 30 days
  seller: SellerBrief;
  category: CategoryBrief;
  review_summary: {
    average: number;
    total: number;
    breakdown: Record<'1'|'2'|'3'|'4'|'5', number>;
  };
}

interface PriceHistoryPoint {
  price: number;
  currency: string;
  recorded_at: string;  // ISO 8601
}
```

---

#### `GET /api/products/[id]/related`

Related products (same category, different seller, similar specs).

**Auth:** None required

**Query:** `limit` (default: 8, max: 20)

**Response:** `{ data: ProductCard[] }`

---

### 2.2 Search

#### `GET /api/search`

Full-text product search via Meilisearch. Supports typo tolerance and faceted filtering.

**Auth:** None required

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | `string` | ✅ | Search query (min 1 char) |
| `page` | `number` | — | Default: 1 |
| `pageSize` | `number` | — | Default: 20, max: 50 |
| `category` | `string` | — | Category slug |
| `brand` | `string` | — | Brand name |
| `sellers` | `string[]` | — | Seller IDs, comma-separated |
| `minPrice` | `number` | — | Min price filter |
| `maxPrice` | `number` | — | Max price filter |
| `minRating` | `number` | — | Min rating (1-5) |
| `inStock` | `boolean` | — | Only in-stock |
| `sortBy` | `'price' \| 'rating' \| 'relevance'` | — | Default: `relevance` |
| `order` | `'asc' \| 'desc'` | — | Default: `desc` |

**Response:**

```typescript
{
  data: {
    hits: ProductCard[];
    facets: {
      categories: FacetCount[];
      brands: FacetCount[];
      sellers: FacetCount[];
      price_ranges: PriceRange[];
      ratings: FacetCount[];
    };
    query: string;
    processing_time_ms: number;
  };
  meta: PaginationMeta;
}

interface FacetCount { value: string; label: string; count: number; }
interface PriceRange { label: string; min: number; max: number; count: number; }
```

---

#### `GET /api/search/suggest`

Autocomplete suggestions — optimised for low latency (< 50ms target).

**Auth:** None required

**Query:** `q` (string, min 1 char), `limit` (number, default: 6, max: 10)

**Response:**

```typescript
{
  data: {
    suggestions: Array<{
      type: 'product' | 'category' | 'brand' | 'seller';
      label: string;
      slug: string;
      thumbnail?: string;
    }>;
    processing_time_ms: number;
  }
}
```

---

### 2.3 Categories

#### `GET /api/categories`

All categories with product counts.

**Auth:** None required

**Response:**

```typescript
{
  data: Category[]
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  product_count: number;
  children: CategoryBrief[];  // sub-categories (empty if already a sub-category)
}
```

---

#### `GET /api/categories/[slug]`

Category detail with sub-categories.

**Auth:** None required

**Response:** `{ data: Category }`

---

### 2.4 Sellers

#### `GET /api/sellers`

Seller directory with optional geolocation filtering.

**Auth:** None required

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | `number` | |
| `pageSize` | `number` | |
| `verified` | `boolean` | Only verified sellers |
| `near` | `string` | `"lat,lng"` — e.g. `"12.9716,77.5946"` |
| `radius` | `number` | Search radius in km (default: 10, requires `near`) |
| `sortBy` | `'rating' \| 'product_count' \| 'created_at'` | |
| `order` | `'asc' \| 'desc'` | |

**Response:** `{ data: SellerCard[], meta: PaginationMeta }`

```typescript
interface SellerCard {
  id: string;
  business_name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  city: string | null;
  is_verified: boolean;
  rating: number;
  review_count: number;
  product_count: number;
  distance_km?: number;  // present when `near` param used
}
```

---

#### `GET /api/sellers/[slug]`

Full seller profile with their product catalogue.

**Auth:** None required

**Query:** `page`, `pageSize`, `sortBy`, `order` (for their products)

**Response:**

```typescript
{
  data: {
    seller: SellerProfile;
    products: ProductCard[];
    meta: PaginationMeta;
  }
}

interface SellerProfile extends SellerCard {
  banner_url: string | null;
  website: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  country: string;
  phone: string | null;
  business_hours: BusinessHours | null;
  verified_at: string | null;
  created_at: string;
}
```

---

### 2.5 Compare

#### `POST /api/compare`

Fetch full comparison payload for 2–4 product IDs.

**Auth:** None required

**Request body:**

```typescript
{
  productIds: string[];  // 2 to 4 UUIDs
}
```

**Response:**

```typescript
{
  data: {
    products: CompareProduct[];
    spec_keys: string[];  // Union of all spec keys across products, ordered
  }
}

interface CompareProduct extends ProductDetail {
  is_cheapest: boolean;
  is_highest_rated: boolean;
  is_best_value: boolean;  // composite score
}
```

---

## 3. Authenticated User Endpoints

> Requires: any authenticated user session (role: `user` or higher)

### 3.1 Wishlist

#### `GET /api/user/wishlist`

User's saved products, optionally filtered by collection.

**Query:** `collection` (string — collection name), `page`, `pageSize`

**Response:** `{ data: WishlistItem[], meta: PaginationMeta }`

```typescript
interface WishlistItem {
  id: string;          // wishlist entry id
  collection_name: string;
  note: string | null;
  added_at: string;
  product: ProductCard;
}
```

---

#### `POST /api/user/wishlist`

Add a product to wishlist.

**Request body:**

```typescript
{
  productId: string;
  collectionName?: string;  // default: "My Wishlist"
  note?: string;
}
```

**Response:** `{ data: WishlistItem }`

**Errors:** `409 CONFLICT` if product already in that collection.

---

#### `DELETE /api/user/wishlist/[id]`

Remove a wishlist entry.

**Response:** `204 No Content`

---

### 3.2 Alerts

#### `GET /api/user/alerts`

List all of the user's active and inactive alerts.

**Query:** `isActive` (boolean), `alertType` (`'price' | 'stock'`)

**Response:** `{ data: Alert[], meta: PaginationMeta }`

```typescript
interface Alert {
  id: string;
  alert_type: 'price' | 'stock';
  target_price: number | null;
  is_active: boolean;
  trigger_count: number;
  last_triggered_at: string | null;
  created_at: string;
  product: ProductCard;
}
```

---

#### `POST /api/user/alerts`

Create a price drop or stock restoration alert.

**Request body:**

```typescript
{
  productId: string;
  alertType: 'price' | 'stock';
  targetPrice?: number;  // required when alertType = 'price'
}
```

**Response:** `{ data: Alert }`

**Errors:** `409 CONFLICT` if alert of same type already exists for this product.

---

#### `PUT /api/user/alerts/[id]`

Toggle alert on/off or update target price.

**Request body:**

```typescript
{
  isActive?: boolean;
  targetPrice?: number;
}
```

**Response:** `{ data: Alert }`

---

#### `DELETE /api/user/alerts/[id]`

Delete an alert.

**Response:** `204 No Content`

---

### 3.3 Reviews

#### `POST /api/reviews`

Submit a product review. One review per user per product.

**Request body:**

```typescript
{
  productId: string;
  rating: number;       // 1 to 5
  title?: string;
  content: string;      // min 10 chars
}
```

**Response:** `{ data: Review }`

**Errors:** `409 CONFLICT` if user already reviewed this product.

---

#### `POST /api/reviews/[id]/vote`

Vote a review as helpful or unhelpful.

**Request body:** `{ isHelpful: boolean }`

**Response:** `{ data: { helpful_count: number; unhelpful_count: number } }`

---

#### `POST /api/reviews/[id]/flag`

Flag a review for moderation.

**Request body:** `{ reason: string }`

**Response:** `204 No Content`

---

### 3.4 User Profile

#### `GET /api/user/profile`

Get authenticated user's profile.

**Response:**

```typescript
{
  data: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phone: string | null;
    role: 'user' | 'seller' | 'admin';
    created_at: string;
  }
}
```

---

#### `PUT /api/user/profile`

Update user profile.

**Request body:**

```typescript
{
  name?: string;
  phone?: string;
  image?: string;  // Cloudinary URL
}
```

**Response:** `{ data: UserProfile }`

---

## 4. Seller Endpoints

> Requires: role `seller`

### 4.1 Products

#### `GET /api/seller/products`

Seller's own product catalogue.

**Query:** `page`, `pageSize`, `status` (`product_status`), `sortBy`, `order`

**Response:** `{ data: ProductDetail[], meta: PaginationMeta }`

---

#### `POST /api/seller/products`

Create a new product.

**Request body:**

```typescript
{
  title: string;
  description: string;
  short_desc?: string;
  categoryId: string;
  images: string[];          // Cloudinary URLs, ordered
  price: number;
  original_price?: number;
  currency?: 'INR' | 'USD';
  stock: number;
  sku?: string;
  brand?: string;
  specs: Record<string, string>;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}
```

**Response:** `{ data: ProductDetail }`

> Product is created in `'draft'` status. It goes live after admin review (Phase 1) or automatically if seller is verified (Phase 2+).

---

#### `PUT /api/seller/products/[id]`

Update an existing product. Partial updates supported.

**Request body:** Partial `ProductCreateInput`

**Response:** `{ data: ProductDetail }`

---

#### `DELETE /api/seller/products/[id]`

Remove a product (sets status to `'removed'`).

**Response:** `204 No Content`

---

#### `POST /api/seller/products/bulk`

Bulk upload products via CSV.

**Request body:** `multipart/form-data` with `file` field (CSV)

**CSV columns:** `title, description, category_slug, price, original_price, stock, brand, sku, specs_json, tags, image_urls`

**Response:**

```typescript
{
  data: {
    created: number;
    failed: number;
    errors: Array<{ row: number; field: string; message: string }>;
  }
}
```

---

### 4.2 Dashboard

#### `GET /api/seller/dashboard`

Performance summary for the seller.

**Query:** `period` — `'7d' | '30d' | '90d'` (default: `'30d'`)

**Response:**

```typescript
{
  data: {
    period: string;
    summary: {
      total_revenue: number;
      orders_count: number;
      product_views: number;
      wishlist_adds: number;
      conversion_rate: number;
    };
    top_products: Array<{
      product: ProductCard;
      views: number;
      orders: number;
      revenue: number;
    }>;
    daily_chart: Array<{
      date: string;
      revenue: number;
      orders_count: number;
      views: number;
    }>;
  }
}
```

---

### 4.3 Onboarding

#### `POST /api/seller/onboarding`

Complete seller registration. Transitions user role to `'seller'` and creates seller record.

**Request body:**

```typescript
{
  business_name: string;
  description?: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;        // default 'IN'
  phone: string;
  gstin?: string;
  logo_url?: string;
  website?: string;
  lat?: number;
  lng?: number;
}
```

**Response:** `{ data: SellerProfile }`

---

## 5. Admin Endpoints

> Requires: role `admin`

### 5.1 Platform Dashboard

#### `GET /api/admin/dashboard`

Platform-wide KPIs.

**Query:** `period` — `'7d' | '30d' | '90d'`

**Response:**

```typescript
{
  data: {
    users: { total: number; new_this_period: number; active: number };
    sellers: { total: number; pending: number; active: number };
    products: { total: number; active: number; draft: number };
    orders: { total: number; revenue: number };
    searches_per_day: number;
    comparison_sessions: number;
  }
}
```

---

### 5.2 Sellers

#### `GET /api/admin/sellers`

All sellers with moderation filter.

**Query:** `status` (`seller_status`), `page`, `pageSize`, `search` (business name)

**Response:** `{ data: SellerCard[], meta: PaginationMeta }`

---

#### `PUT /api/admin/sellers/[id]`

Approve, reject, or suspend a seller.

**Request body:**

```typescript
{
  action: 'approve' | 'reject' | 'suspend';
  reason?: string;  // required for reject/suspend
}
```

**Response:** `{ data: SellerProfile }`

---

### 5.3 Products

#### `GET /api/admin/products`

All products with moderation filter.

**Query:** `status` (`product_status`), `sellerId`, `page`, `pageSize`, `search`

**Response:** `{ data: ProductDetail[], meta: PaginationMeta }`

---

#### `PUT /api/admin/products/[id]`

Moderate a product.

**Request body:**

```typescript
{
  action: 'feature' | 'unfeature' | 'hide' | 'remove' | 'activate';
  reason?: string;
}
```

**Response:** `{ data: ProductDetail }`

---

### 5.4 Users

#### `GET /api/admin/users`

**Query:** `role` (`user_role`), `isActive`, `page`, `pageSize`, `search` (email/name)

**Response:** `{ data: UserProfile[], meta: PaginationMeta }`

---

#### `PUT /api/admin/users/[id]`

**Request body:** `{ isActive: boolean; role?: user_role }`

**Response:** `{ data: UserProfile }`

---

### 5.5 Reviews

#### `GET /api/admin/reviews`

Flagged reviews awaiting moderation.

**Query:** `page`, `pageSize`

**Response:** `{ data: Review[], meta: PaginationMeta }`

---

#### `PUT /api/admin/reviews/[id]`

**Request body:** `{ action: 'approve' | 'remove'; reason?: string }`

**Response:** `{ data: Review }`

---

## 6. FastAPI Microservice Endpoints

> Internal only — called by Next.js Route Handlers via `X-Service-Token` header. Not exposed to the public internet.

### 6.1 Search Service (`http://search-service:8001`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/search` | Query Meilisearch index with enrichment |
| `GET` | `/suggest` | Autocomplete suggestions |
| `POST` | `/index/sync` | Sync a single product to index |
| `POST` | `/index/rebuild` | Rebuild full index from PostgreSQL |
| `DELETE` | `/index/product/{id}` | Remove product from index |

### 6.2 Recommendations Service (`http://recommendations-service:8002`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/recommend/user/{user_id}` | Personalised product feed |
| `GET` | `/recommend/similar/{product_id}` | Content-based similar products |
| `GET` | `/recommend/trending` | Platform trending (no auth) |
| `POST` | `/recommend/train` | Trigger model retraining |

### 6.3 Analytics Service (`http://analytics-service:8003`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/seller/{seller_id}` | Seller metrics for period |
| `GET` | `/analytics/platform` | Platform KPIs |
| `POST` | `/analytics/aggregate` | Trigger nightly aggregation |
| `POST` | `/analytics/event` | Record a product view / click event |

### 6.4 Notifications Service (`http://notifications-service:8004`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/notify/price-drop` | Run price drop check |
| `POST` | `/notify/stock-alert` | Run stock restoration check |
| `POST` | `/notify/send` | Send a single notification |

---

## 7. Webhooks (Outgoing)

Andromeda sends webhooks to internal FastAPI services on data changes:

| Event | Payload | Recipient |
|---|---|---|
| `product.created` | `{ product_id, seller_id }` | Search Service (index sync) |
| `product.updated` | `{ product_id }` | Search Service (index sync) |
| `product.deleted` | `{ product_id }` | Search Service (remove from index) |
| `order.delivered` | `{ order_id, user_id, product_ids[] }` | Reviews (enable verified purchase) |
| `price.changed` | `{ product_id, seller_id, new_price }` | Notifications (check alerts) |

Webhook payloads include a `X-Webhook-Secret` header for verification.
