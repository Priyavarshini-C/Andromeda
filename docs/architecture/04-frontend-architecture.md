# Andromeda — Frontend Architecture

> **Version:** 1.0 | **Status:** Draft | **Date:** June 2026

---

## 1. Overview

The frontend is built on **Next.js 16 App Router** with React Server Components as the default rendering strategy. The design system is derived from the **Andromeda Discovery System** defined in Stitch — a light-mode-primary, "Corporate Modern with Cinematic edge" aesthetic anchored in a Deep Space narrative.

**Key principles:**
- RSC-first: every component is a Server Component unless it explicitly needs browser APIs or interactivity
- Islands of interactivity: client components are small, focused, and co-located with their RSC parents
- Design token consistency: all colours, typography, spacing, and shapes come from the Andromeda Discovery System — no ad-hoc values
- Performance budget: initial JS bundle < 150 KB gzipped; LCP < 2.5s on all key pages

---

## 2. App Router Directory Structure

```
src/
├── app/
│   │
│   ├── (marketing)/                    # Public marketing pages
│   │   ├── page.tsx                    # Landing page — Hero, Categories, Trends, CTA
│   │   ├── about/page.tsx
│   │   ├── pricing/page.tsx            # Seller subscription pricing
│   │   ├── blog/[slug]/page.tsx
│   │   └── layout.tsx                  # Marketing shell (Navbar + Footer)
│   │
│   ├── (auth)/                         # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/[token]/page.tsx
│   │   └── layout.tsx                  # Minimal centred auth shell
│   │
│   ├── (dashboard)/                    # Authenticated user pages
│   │   ├── profile/page.tsx
│   │   ├── wishlist/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx                # Order history
│   │   │   └── [id]/page.tsx          # Order detail
│   │   ├── alerts/page.tsx
│   │   └── layout.tsx                  # Dashboard sidebar shell
│   │
│   ├── (seller)/                       # Seller-role pages
│   │   ├── onboarding/
│   │   │   ├── page.tsx                # Multi-step registration
│   │   │   └── [step]/page.tsx        # Business info / Products / Go Live
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # Sales overview
│   │   │   ├── products/
│   │   │   │   ├── page.tsx           # Product list
│   │   │   │   ├── new/page.tsx       # Add product
│   │   │   │   └── [id]/page.tsx     # Edit product
│   │   │   ├── orders/page.tsx
│   │   │   └── analytics/page.tsx
│   │   └── layout.tsx                  # Seller hub shell
│   │
│   ├── (admin)/                        # Admin-role pages
│   │   ├── dashboard/page.tsx
│   │   ├── sellers/
│   │   │   ├── page.tsx               # Seller approval queue
│   │   │   └── [id]/page.tsx         # Seller detail
│   │   ├── products/page.tsx
│   │   ├── users/page.tsx
│   │   ├── reviews/page.tsx           # Flagged reviews
│   │   └── layout.tsx                  # Admin shell
│   │
│   ├── products/                       # Public product pages
│   │   ├── page.tsx                    # RSC: Product listing grid with filters
│   │   └── [slug]/
│   │       ├── page.tsx               # RSC + Suspense streaming: Product detail
│   │       └── @comparison/           # Parallel route: comparison drawer overlay
│   │           └── page.tsx
│   │
│   ├── search/
│   │   └── page.tsx                   # RSC: Search results (dynamic)
│   │
│   ├── compare/
│   │   └── page.tsx                   # Client: Side-by-side comparison
│   │
│   ├── categories/
│   │   ├── page.tsx                   # ISR: Category browse grid
│   │   └── [slug]/page.tsx           # ISR: Category products
│   │
│   ├── sellers/
│   │   ├── page.tsx                   # ISR: Seller directory
│   │   └── [slug]/page.tsx           # ISR: Seller profile page
│   │
│   ├── local/
│   │   └── page.tsx                   # Dynamic: Nearby seller discovery (geo)
│   │
│   ├── api/                           # Route Handlers (see Backend Architecture)
│   │
│   ├── layout.tsx                     # Root layout: fonts, providers, metadata
│   ├── not-found.tsx
│   ├── error.tsx
│   └── loading.tsx
│
├── components/                        # Shared components
│   ├── ui/                            # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   │
│   ├── product/
│   │   ├── ProductCard.tsx            # RSC-safe: image, price, seller, rating
│   │   ├── ProductGrid.tsx            # RSC: responsive grid with skeleton loading
│   │   ├── ProductListItem.tsx        # RSC: list-view alternative to card
│   │   ├── PriceTag.tsx               # RSC: formatted price + currency + discount badge
│   │   ├── PriceHistory.tsx           # Client: sparkline chart (Recharts)
│   │   ├── PriceCompareTable.tsx      # Client: multi-seller price table
│   │   ├── SpecsTable.tsx             # RSC: product specification key-value table
│   │   ├── ProductImages.tsx          # Client: image gallery with zoom
│   │   └── StockBadge.tsx            # RSC: in-stock / low-stock / out-of-stock
│   │
│   ├── search/
│   │   ├── SearchBar.tsx              # Client: autocomplete, debounced, keyboard nav
│   │   ├── SearchSuggestions.tsx      # Client: dropdown suggestion list
│   │   ├── FilterPanel.tsx            # Client: price, rating, brand, seller filters
│   │   ├── ActiveFilters.tsx          # Client: applied filter chips with remove
│   │   ├── SortSelect.tsx             # Client: sort by price/rating/newest
│   │   └── ResultsCount.tsx          # RSC: "Showing X results for Y"
│   │
│   ├── compare/
│   │   ├── CompareTable.tsx           # Client: feature matrix, up to 4 products
│   │   ├── CompareDrawer.tsx          # Client: slide-in tray on product pages
│   │   ├── CompareSelector.tsx        # Client: add/remove from compare (Zustand)
│   │   ├── CompareBar.tsx             # Client: sticky bottom bar with compare list
│   │   └── AISummary.tsx             # Client: AI-generated comparison summary (Phase 3)
│   │
│   ├── layout/
│   │   ├── Navbar.tsx                 # Client: search + auth actions; RSC for links
│   │   ├── Footer.tsx                 # RSC: static footer
│   │   ├── Sidebar.tsx                # Client: dashboard / seller sidebar
│   │   ├── Breadcrumb.tsx             # RSC: dynamic breadcrumb
│   │   └── ThemeToggle.tsx           # Client: light/dark mode toggle
│   │
│   ├── seller/
│   │   ├── SellerCard.tsx             # RSC: seller tile in directory
│   │   ├── SellerBadge.tsx           # RSC: verified badge + rating
│   │   ├── SellerMap.tsx             # Client: location on Leaflet map
│   │   └── BusinessHours.tsx         # RSC: open/closed status
│   │
│   ├── reviews/
│   │   ├── ReviewCard.tsx             # RSC: review with verified badge
│   │   ├── ReviewList.tsx             # RSC + Suspense: paginated reviews
│   │   ├── ReviewForm.tsx             # Client: star rating + text form
│   │   ├── StarRating.tsx             # RSC: star display (static)
│   │   ├── StarRatingInput.tsx        # Client: interactive star input
│   │   ├── RatingBreakdown.tsx        # RSC: 1–5 star distribution bar chart
│   │   └── HelpfulVote.tsx           # Client: helpful/unhelpful buttons
│   │
│   ├── alerts/
│   │   ├── AlertModal.tsx             # Client: create price/stock alert dialog
│   │   ├── AlertList.tsx              # Client: user's active alerts
│   │   └── AlertToggle.tsx           # Client: bell icon toggle on product
│   │
│   ├── wishlist/
│   │   ├── WishlistButton.tsx         # Client: heart icon toggle
│   │   ├── WishlistGrid.tsx           # Client: saved products grid
│   │   └── CollectionSelector.tsx     # Client: choose/create collection
│   │
│   ├── local/
│   │   ├── NearbyMap.tsx             # Client: Leaflet map of nearby sellers
│   │   └── SellerDistanceBadge.tsx   # Client: "2.3 km away"
│   │
│   └── shared/
│       ├── LoadingSkeleton.tsx        # Generic skeleton placeholder
│       ├── EmptyState.tsx             # Zero-results illustration + CTA
│       ├── ErrorBoundary.tsx          # Client: error recovery UI
│       ├── Pagination.tsx             # RSC: page navigation
│       ├── ImageUpload.tsx            # Client: Cloudinary upload widget
│       └── ConfirmDialog.tsx          # Client: destructive action confirmation
│
├── hooks/
│   ├── useSearch.ts                   # Debounced search + TanStack Query
│   ├── useCompare.ts                  # Compare list Zustand selector
│   ├── useWishlist.ts                 # Optimistic wishlist toggle
│   ├── useAlerts.ts                   # Alert CRUD with TanStack Query
│   ├── useGeoLocation.ts             # Browser Geolocation API
│   ├── useInfiniteProducts.ts        # Infinite scroll for product grid
│   ├── useDebounce.ts                # Generic debounce hook
│   └── useLocalStorage.ts            # SSR-safe localStorage wrapper
│
├── store/
│   ├── compare.store.ts               # Zustand: compare list (max 4 product IDs)
│   └── ui.store.ts                    # Zustand: sidebar open, modal state, theme
│
├── lib/
│   ├── api/
│   │   ├── products.ts               # Typed fetch wrappers → /api/products
│   │   ├── search.ts                 # Meilisearch helpers + TanStack Query keys
│   │   ├── sellers.ts
│   │   ├── user.ts                   # Wishlist, alerts, profile
│   │   └── compare.ts
│   ├── auth/
│   │   └── config.ts                 # NextAuth.js v5 configuration
│   ├── db/
│   │   ├── index.ts                  # Drizzle ORM singleton
│   │   └── schema/                   # Drizzle schema definitions
│   └── utils/
│       ├── format.ts                 # formatPrice, formatDate, slugify
│       ├── cn.ts                     # Tailwind class merge (clsx + twMerge)
│       ├── validation.ts             # Shared Zod schemas
│       └── constants.ts              # App-wide constants
│
└── types/
    ├── product.ts                    # Product, ProductCard, ProductDetail, ProductStatus
    ├── seller.ts                     # Seller, SellerProfile, SellerStatus
    ├── user.ts                       # User, Session, UserRole
    ├── search.ts                     # SearchQuery, SearchResult, SearchFacets
    ├── api.ts                        # ApiResponse<T>, ApiError, PaginationMeta
    └── next-auth.d.ts               # NextAuth session type augmentation
```

---

## 3. Design System — Andromeda Discovery System

Sourced from the Stitch project **"Andromeda Discovery Platform"** (project ID `10757132292945962125`). The design theme is **light-mode primary**, "Corporate Modern with a Cinematic edge" — a "Deep Space" narrative that feels like a high-end observatory of products.

### 3.1 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` (Night Navy) | `#00183c` | Nav bg, structural anchors, primary text headings |
| `primary-container` | `#0f2d5a` | Card headers, dark section backgrounds |
| `secondary` (Star Blue) | `#0060ab` | CTA buttons, links, active states, focus rings |
| `secondary-container` | `#5ca6fe` | Button hover, chip backgrounds |
| `tertiary` (Flare Orange) | `#f97316` | Discount badges, urgency cues, sale labels |
| `surface` (Void White) | `#f6f9fe` | Base page background |
| `surface-container-lowest` | `#ffffff` | Card backgrounds, modals |
| `surface-container` | `#ebeef3` | Input backgrounds, subtle section fills |
| `on-surface` | `#181c20` | Primary body text |
| `on-surface-variant` | `#44474f` | Secondary/muted text |
| `outline` | `#747780` | Borders, dividers |
| `outline-variant` | `#c4c6d0` | Subtle card borders |
| `error` | `#ba1a1a` | Error states, validation messages |

### 3.2 Typography

| Style | Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| `display-lg` | Plus Jakarta Sans | 48px | 700 | 56px | -0.02em |
| `headline-lg` | Plus Jakarta Sans | 32px | 600 | 40px | -0.01em |
| `headline-lg-mobile` | Plus Jakarta Sans | 28px | 600 | 36px | — |
| `headline-md` | Plus Jakarta Sans | 24px | 600 | 32px | — |
| `body-lg` | Plus Jakarta Sans | 16px | 400 | 24px | — |
| `body-md` | Plus Jakarta Sans | 15px | 400 | 22px | — |
| `price-display` | Plus Jakarta Sans | 20px | 700 | 28px | — |
| `label-sm` | Plus Jakarta Sans | 13px | 600 | 18px | 0.05em |

Load via `next/font/google`:
```typescript
import { Plus_Jakarta_Sans } from 'next/font/google';
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-plus-jakarta-sans',
});
```

### 3.3 Spacing & Layout

| Token | Value |
|---|---|
| Base unit | 4px |
| Container max-width | 1280px |
| Column gutter | 24px |
| Desktop margin | 40px |
| Mobile margin | 16px |
| Grid | 12-column (desktop) → 4-column (mobile) |

### 3.4 Elevation & Depth

| Level | Surface | Shadow |
|---|---|---|
| Base | `#f6f9fe` (Void White) | — |
| Cards / Panels | `#ffffff` with 1px `outline-variant` border | `0 2px 8px rgba(15,45,90,0.06)` |
| Hover (lifted) | `#ffffff` | `0 8px 24px rgba(15,45,90,0.10)` |

### 3.5 Shape System

| Component | Radius |
|---|---|
| Buttons, inputs, small controls | 8px |
| Product cards, modals, comparison modules | 12px |
| Tags, category chips, "Best Price" badges | 20px+ (pill) |

### 3.6 Component Specs

#### Product Card
```
┌─────────────────────────────┐  ← 12px radius, 1px outline-variant border
│  [Product Image]  [% OFF]   │  ← Flare Orange badge top-right
│                             │
│  [Brand]                    │  ← label-sm, on-surface-variant
│  Product Title              │  ← body-lg, on-surface, 2 lines max
│  ★ 4.2  (128 reviews)       │  ← 16px star, Flare Orange
│                             │
│  ₹12,999   ~~₹15,000~~      │  ← price-display (Star Blue), strike secondary
│  Sold by: NebulaStore       │  ← label-sm, on-surface-variant
│                             │
│  [Compare]  [♥ Save]        │  ← Outline button, Ghost icon button
└─────────────────────────────┘
   Hover: box-shadow lifts to 0 8px 24px rgba(15,45,90,0.10)
```

#### Search Bar
```
Height: 44px
Border: 1px solid outline-variant (#c4c6d0)
Background: surface-container-lowest (#ffffff)
Focus: 2px solid secondary (#0060ab) ring, 0.2 opacity
Icon: 20px Star Blue search icon (left)
```

#### Buttons
| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | Night Navy `#00183c` | White | — | Main navigation actions |
| Accent/CTA | Star Blue `#0060ab` | White | — | "Compare", "Buy Now" |
| Outline | Transparent | Star Blue | 1px Star Blue | Secondary actions |
| Ghost | Transparent | `on-surface` | — | Icon-only actions |

#### Comparison Table
```
Column headers:     Night Navy bg (#0f2d5a), white text, 14px label-sm
Alternating rows:   secondary-container (#5ca6fe) at 0.3 opacity
Winner highlight:   Aurora Green badge (#22c55e pill shape)
Feature cells:      body-md, on-surface
Check/Cross icons:  16px, secondary / error colour
```

#### Badges
| Variant | Background | Text | Shape | Usage |
|---|---|---|---|---|
| "Best Price" | Aurora Green `#22c55e` | White | Pill (20px radius) | Lowest price indicator |
| "X% OFF" | Flare Orange `#f97316` | White | Pill | Discount |
| "Verified" | Night Navy `#0f2d5a` | White | Pill | Admin/Platform badge |
| "In Stock" | `#dcfce7` | `#166534` | Pill | Availability |

---

## 4. State Management

| State Type | Tool | Scope | Examples |
|---|---|---|---|
| **Server state (read)** | TanStack Query v5 | Global | Product listings, search results, wishlist, orders |
| **Mutations** | Server Actions (`'use server'`) | Per-action | Review submit, wishlist toggle, alert create |
| **Global UI** | Zustand | Global | Compare list (max 4), sidebar open, modal state |
| **Form** | React Hook Form + Zod | Local | Login, onboarding, product upload, review |
| **URL** | `useSearchParams` / Next.js router | URL | Search query, filters, sort, page, category |
| **Ephemeral local** | `useState` / `useReducer` | Component | Toggle, open/close, hover |

### Zustand stores

```typescript
// store/compare.store.ts
interface CompareStore {
  productIds: string[];       // max 4
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

// store/ui.store.ts
interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}
```

### TanStack Query key conventions

```typescript
// All query keys follow ['entity', params] pattern
queryKeys.products.list(params)       // ['products', 'list', params]
queryKeys.products.detail(slug)       // ['products', 'detail', slug]
queryKeys.search.results(query)       // ['search', 'results', query]
queryKeys.user.wishlist()             // ['user', 'wishlist']
queryKeys.user.alerts()              // ['user', 'alerts']
```

---

## 5. Routing Conventions

### Route Groups
Next.js route groups `(groupName)` are used for layout segregation — **not** part of the URL:

| Group | URL pattern | Layout | Auth required |
|---|---|---|---|
| `(marketing)` | `/`, `/about`, `/pricing` | Navbar + Footer | ❌ |
| `(auth)` | `/login`, `/register` | Minimal centred | ❌ |
| `(dashboard)` | `/profile`, `/wishlist`, `/orders`, `/alerts` | Dashboard sidebar | ✅ user |
| `(seller)` | `/dashboard/*`, `/onboarding` | Seller hub shell | ✅ seller |
| `(admin)` | `/dashboard/admin/*` | Admin shell | ✅ admin |

### Parallel Routes
The product detail page uses a **parallel route** for the comparison drawer overlay:

```
products/[slug]/
  page.tsx              ← main product detail content
  @comparison/
    page.tsx            ← comparison drawer (rendered in parallel slot)
  layout.tsx            ← renders both slots
```

### Metadata per page

Every page exports metadata for SEO:
```typescript
export const metadata: Metadata = {
  title: `${product.title} — Andromeda`,
  description: product.short_desc,
  openGraph: { title, description, images: [product.thumbnail_url] },
};
```

Dynamic pages use `generateMetadata()`:
```typescript
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  return { title: `${product.title} — Andromeda`, ... };
}
```

---

## 6. Data Fetching Patterns

### Server Component — ISR with cache tags

```typescript
// app/(marketing)/categories/[slug]/page.tsx
export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function CategoryPage({ params }) {
  const products = await fetch(`${baseUrl}/api/products?category=${params.slug}`, {
    next: { tags: ['products', `category:${params.slug}`] },
  }).then(r => r.json());

  return <ProductGrid products={products.data} />;
}
```

### Server Component — Suspense streaming

```typescript
// app/products/[slug]/page.tsx
export default function ProductPage({ params }) {
  return (
    <>
      <ProductHero slug={params.slug} />        {/* loads immediately */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewList productSlug={params.slug} />  {/* streams in */}
      </Suspense>
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts slug={params.slug} />    {/* streams in */}
      </Suspense>
    </>
  );
}
```

### Client Component — TanStack Query

```typescript
// hooks/useSearch.ts
export function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  return useQuery({
    queryKey: queryKeys.search.results(debouncedQuery),
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });
}
```

---

## 7. Testing Strategy

| Type | Tool | Coverage Target | Focus |
|---|---|---|---|
| Unit | Vitest | > 80% | Utility functions, hooks, Zustand store logic |
| Component | Vitest + Testing Library | > 70% | UI components, form validation, conditional rendering |
| API | Vitest + Supertest | > 90% | All Route Handlers and Server Actions |
| E2E | Playwright | All critical paths | Search, compare, auth, wishlist, seller onboarding |
| Performance | Lighthouse CI + k6 | Every deploy | Core Web Vitals, API load at 1,000 concurrent |
| Accessibility | axe-core + Playwright | All public pages | WCAG 2.1 AA |

### Critical E2E paths (Playwright)

1. Anonymous user searches for a product and compares 2 items
2. User registers, logs in, adds to wishlist, sets price alert
3. Seller registers, lists a product, edits it
4. Admin approves a seller, features a product
5. User submits a review on a purchased product
