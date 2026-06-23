# Andromeda — Development Roadmap

> **Version:** 1.0 | **Status:** Draft | **Date:** June 2026
> **Team size:** 4 engineers | **Timeline:** 12 months to post-launch

---

## Overview

| Phase | Name | Duration | Focus |
|---|---|---|---|
| **Phase 1** | MVP — Core Discovery | Months 1–3 | Search, browse, compare, auth |
| **Phase 2** | Enhanced Engagement | Months 4–6 | Wishlist, cart, alerts, reviews, sellers |
| **Phase 3** | Smart Features | Months 7–9 | AI recommendations, personalisation |
| **Phase 4** | Local Business | Months 9–12 | Geo discovery, local seller marketplace |
| **Phase 5** | Scale & Intelligence | Post-launch | Analytics, fraud detection, global marketplaces |

---

## Phase 1 — MVP: Core Discovery (Months 1–3)

**Goal:** A publicly accessible product discovery platform where users can search, browse, and compare products.

### Sprint 1 — Foundation (Weeks 1–2)

| Task | Owner | Priority |
|---|---|---|
| Next.js 16 project scaffolding (App Router, TypeScript strict) | FE | P0 |
| Tailwind CSS 4 with Andromeda Discovery System design tokens | FE | P0 |
| `Plus Jakarta Sans` font via `next/font/google` | FE | P0 |
| shadcn/ui initialisation + base component setup | FE | P0 |
| Supabase project creation + PostgreSQL provisioning | BE | P0 |
| Drizzle ORM schema setup + initial migration | BE | P0 |
| GitHub Actions CI skeleton (lint, typecheck, build) | DevOps | P0 |
| Environment variable structure (local `.env.local`, Vercel) | DevOps | P0 |
| `docs/architecture/` documentation files | Lead | P1 |

**Deliverable:** Blank Next.js app with design system, DB connected, CI passing.

---

### Sprint 2 — Auth & Shell (Weeks 3–4)

| Task | Priority |
|---|---|
| NextAuth.js v5 setup — Google OAuth + email/password | P0 |
| Auth tables migration (users, accounts, sessions, verification_tokens) | P0 |
| Root `layout.tsx` with providers (TanStack Query, Zustand, Auth) | P0 |
| `Navbar` component — logo, search placeholder, auth actions | P0 |
| `Footer` component | P1 |
| Auth pages — Login, Register (with form validation via Zod) | P0 |
| Forgot password + email verification (Resend integration) | P1 |
| RBAC middleware — route protection by role | P0 |
| `(auth)` route group layout | P0 |

**Deliverable:** Working authentication with Google OAuth and email/password. Protected routes working.

---

### Sprint 3 — Product Listing (Weeks 5–6)

| Task | Priority |
|---|---|
| `products` + `categories` + `sellers` DB migrations | P0 |
| Seed data: 10 root categories, 3 test sellers, 50 test products | P0 |
| `GET /api/products` Route Handler — list with filters + pagination | P0 |
| `GET /api/categories` Route Handler | P0 |
| `ProductCard` RSC component | P0 |
| `ProductGrid` RSC component with Suspense skeleton | P0 |
| `PriceTag` RSC with INR formatting + discount badge | P0 |
| `StockBadge` RSC | P1 |
| Category browse page (`/categories/[slug]`) with ISR | P1 |
| Products listing page (`/products`) with filter params in URL | P0 |

**Deliverable:** Browsable product grid with category filtering and pagination.

---

### Sprint 4 — Search (Weeks 7–8)

| Task | Priority |
|---|---|
| Meilisearch Cloud account + index creation | P0 |
| Search index settings configuration | P0 |
| FastAPI Search Service — skeleton + `/search` + `/suggest` endpoints | P0 |
| Meilisearch indexer webhook — on product DB write | P0 |
| `GET /api/search` Route Handler (delegates to FastAPI) | P0 |
| `GET /api/search/suggest` Route Handler | P0 |
| `SearchBar` client component with debounce (300ms) | P0 |
| `SearchSuggestions` dropdown component | P0 |
| Search results page (`/search`) — RSC with Suspense | P0 |
| Redis caching layer for search results (60s TTL) | P1 |
| `FilterPanel` client component (price, rating, brand) | P1 |
| `ActiveFilters` chips component | P1 |

**Deliverable:** Full-text search with autocomplete. Typo-tolerant, < 100ms response.

---

### Sprint 5 — Product Detail (Weeks 9–10)

| Task | Priority |
|---|---|
| `GET /api/products/[id]` Route Handler — full detail + price history | P0 |
| Product detail page (`/products/[slug]`) — RSC + Suspense streaming | P0 |
| `ProductImages` client component — gallery with zoom | P0 |
| `SpecsTable` RSC component | P0 |
| `PriceHistory` client component — sparkline chart | P1 |
| `ReviewList` RSC with Suspense (placeholder data) | P1 |
| `RatingBreakdown` RSC | P1 |
| `GET /api/products/[id]/related` Route Handler | P1 |
| Related products section | P1 |
| Product detail SEO — `generateMetadata()` + JSON-LD | P1 |

**Deliverable:** Rich product detail pages with streaming content.

---

### Sprint 6 — Price Comparison (Weeks 11–12)

| Task | Priority |
|---|---|
| `POST /api/compare` Route Handler | P0 |
| `PriceCompareTable` client component — multi-seller price table sorted by price | P0 |
| Best-price badge + "Best Value" composite score logic | P0 |
| Price comparison section on product detail page | P0 |
| `price_history` DB migration + price recording on product create/update | P0 |

**Deliverable:** Users can compare prices from multiple sellers on any product.

---

### Sprint 7 — Side-by-Side Compare (Weeks 13–14)

| Task | Priority |
|---|---|
| Zustand compare store (`compare.store.ts`) — max 4 products | P0 |
| `CompareSelector` client component — add/remove from compare | P0 |
| `CompareBar` sticky bottom bar | P0 |
| `CompareTable` full feature matrix client component | P0 |
| `CompareDrawer` slide-in overlay on product pages (parallel route) | P0 |
| Compare page (`/compare`) | P0 |
| `comparisons` DB migration + save comparison session | P1 |
| Framer Motion: compare table entrance animation | P1 |

**Deliverable:** Users can compare 2–4 products side-by-side.

---

### Sprint 8 — MVP Stabilisation (Weeks 15–16)

| Task | Priority |
|---|---|
| SEO: Metadata API on all public pages (title, description, OG) | P1 |
| JSON-LD structured data for products and sellers | P1 |
| Sitemap + robots.txt generation | P1 |
| Lighthouse CI integration — fail pipeline if score < 85 | P0 |
| Playwright E2E test suite — search, compare, auth flows | P0 |
| Vitest unit tests — utilities, hooks, Zustand stores (> 80% coverage) | P0 |
| Vercel preview deployment per PR | P0 |
| Performance audit — LCP, INP, CLS targets | P0 |
| Mobile responsiveness audit (320px, 768px, 1024px) | P0 |
| Sentry integration (frontend + Route Handlers) | P1 |

**Deliverable:** Production-ready MVP deployed to staging. All P0 features complete.

---

## Phase 2 — Enhanced Engagement (Months 4–6)

**Goal:** Registered users engage deeply; local sellers join and list products.

### Sprint 9 — Wishlist & Cart (Weeks 17–18)

| Feature | Key Tasks |
|---|---|
| **Wishlist** | `wishlists` migration · `WishlistButton` client component · `useWishlist` hook (optimistic) · Wishlist page · `GET /api/user/wishlist` · `POST` · `DELETE` |
| **Shopping Cart** | Cart Zustand store · `CartDrawer` component · Cart page · Add/remove/quantity · Session persistence via localStorage |

---

### Sprint 10 — Price & Stock Alerts (Weeks 19–20)

| Feature | Key Tasks |
|---|---|
| **Alerts** | `alerts` migration · `AlertModal` component · `AlertToggle` bell icon · Alert list page · `GET/POST/PUT/DELETE /api/user/alerts` |
| **Notification Worker** | FastAPI Notifications Service · APScheduler (every 5 min) · Price change detection logic · Resend email templates (price drop, stock alert) |

---

### Sprint 11 — Reviews (Weeks 21–22)

| Feature | Key Tasks |
|---|---|
| **Reviews** | `reviews` + `review_votes` migration · `ReviewForm` (Star rating input + text) · `ReviewCard` with verified badge · `HelpfulVote` · Flag flow · `POST /api/reviews` · Vote + flag endpoints |

---

### Sprint 12 — Seller Onboarding (Weeks 23–24)

| Feature | Key Tasks |
|---|---|
| **Onboarding** | `sellers` migration · Multi-step form (Business Info → Products → Go Live) · Cloudinary image upload · `POST /api/seller/onboarding` · Admin review queue |
| **Admin moderation** | Seller approval/rejection flow · Email notification on status change |

---

### Sprint 13 — Seller Dashboard (Weeks 25–26)

| Feature | Key Tasks |
|---|---|
| **Product CRUD** | Seller product list · New product form · Edit product · Bulk CSV upload · `GET/POST/PUT/DELETE /api/seller/products` |
| **Seller Hub** | Seller dashboard overview (sales, views, top products) · `GET /api/seller/dashboard` |

---

### Sprint 14 — Advanced Filters & Admin (Weeks 27–28)

| Feature | Key Tasks |
|---|---|
| **Advanced Filters** | Price range slider · Brand multi-select · Rating filter · Seller filter · Availability toggle · URL state sync |
| **Admin Dashboard** | Admin seller list + approve/reject · Admin product moderation · Admin user list · Flagged review queue |

---

## Phase 3 — Smart Features (Months 7–9)

**Goal:** AI-powered discovery differentiates the platform.

| Sprint | Feature | Key Tasks |
|---|---|---|
| 15 | **AI Recommendations** | FastAPI Recommendations Service (content-based Phase 1) · Personalised feed on user dashboard · `GET /recommend/user/{id}` |
| 16 | **Smart Autocomplete** | Meilisearch faceted filtering tuning · Category-scoped suggestions · Trending searches display |
| 17 | **AI Comparison Summary** | LLM integration (Gemini API) · `AISummary` component · "Product A is ₹500 cheaper; Product B rates higher on durability" |
| 18 | **Personalised Discovery Feed** | Trending section on landing page · Seasonal recommendations · User browsing history tracking (event log) |
| 19 | **Performance Hardening** | Core Web Vitals deep audit · `next/image` optimisation · Bundle analysis + code splitting · Redis cache tuning |

---

## Phase 4 — Local Business Empowerment (Months 9–12)

**Goal:** Surface local and independent sellers through geolocation.

| Sprint | Feature | Key Tasks |
|---|---|---|
| 20 | **Local Seller Marketplace** | Location fields in seller onboarding · PostGIS `geography` column · Business hours component · Local seller tier badge |
| 21 | **Nearby Discovery** | `NearbyMap` (Leaflet) · `/api/sellers?near=lat,lng&radius=10` · `SellerDistanceBadge` · List/map view toggle · `GET /local` page |
| 22 | **Seller Inventory Dashboard** | Stock level management · Low-stock alerts (seller-facing) · Order tracking UI · Performance metrics charts |
| 23 | **Enhanced Business Profiles** | Seller profile page v2 · Location map embed · Business hours open/closed display · Contact form |

---

## Phase 5 — Scale & Intelligence (Post-Launch)

| Initiative | Description | Target Quarter |
|---|---|---|
| **Seller Analytics Dashboard** | Revenue trends, product performance, customer engagement, cohort analysis | Month 13–14 |
| **Authenticity Verification** | NLP fake review detection (FastAPI ML model) · Seller fraud pattern detection · Velocity checks | Month 14–15 |
| **Price Prediction Engine** | FastAPI ML model forecasting discount windows and optimal buying time · Price trend charts | Month 15–16 |
| **Collaborative Filtering** | Upgrade Recommendations Service from content-based to hybrid collaborative + content model | Month 15 |
| **Global Marketplace Integration** | Live product feeds from Amazon, Flipkart, Myntra, Meesho, Etsy via official APIs | Month 16–18 |
| **Mobile App (React Native)** | iOS and Android app sharing API and design system | Month 18 |
| **Andromeda Pay** | In-platform escrow payments · Integrated checkout · Razorpay/Stripe integration | Month 18+ |
| **B2B Procurement Module** | Bulk ordering · RFQ comparison · Vendor evaluation | Month 18+ |
| **AI Shopping Assistant** | Conversational interface: "Best earbuds under ₹2000" · "Cake shop near me" | Q3 2027 |

---

## Cross-Cutting Concerns (All Phases)

### Testing (Every Sprint)

| Type | Tool | Target |
|---|---|---|
| Unit | Vitest | > 80% line coverage |
| Component | Vitest + Testing Library | > 70% component coverage |
| API | Vitest + Supertest | > 90% Route Handler coverage |
| E2E | Playwright | All critical user paths |
| Performance | Lighthouse CI + k6 | Every production deploy |
| Accessibility | axe-core + Playwright | All public pages |

### Accessibility (Every Sprint)
- WCAG 2.1 Level AA
- Keyboard navigation on all interactive elements
- `aria-label` on all icon-only buttons
- Screen reader testing with VoiceOver (macOS) and NVDA (Windows)

### Security (Ongoing)
- Dependabot: dependency scanning; patches within 48 hours
- Penetration testing: Phase 3 (before AI features launch)
- GDPR: user data export + account deletion endpoints — Phase 1
- Secrets: Vercel Environment Variables + Doppler — never committed

### Monitoring (Phase 1 onwards)
- Sentry: error tracking for frontend + Route Handlers + FastAPI
- Vercel Analytics: Web Vitals dashboard
- Uptime monitoring: 99.9% SLA target
- Custom KPI dashboard: MAU, searches/day, comparison sessions

---

## Success KPIs

| Metric | Target | Timeline |
|---|---|---|
| Monthly Active Users (MAU) | 100,000 | Month 12 |
| Search queries per day | 500,000+ | Month 6 |
| Registered sellers / businesses | 5,000+ | Month 6 |
| Product comparison sessions | > 30% of all sessions | Month 9 |
| User retention (30-day) | > 40% | Month 9 |
| Customer Satisfaction Score (CSAT) | > 4.2 / 5.0 | Ongoing |
| Local business registrations | 2,000+ | Month 6 |
| Lighthouse Performance Score | > 90 on all key pages | Phase 1 |
| API response p95 | < 200ms cached, < 500ms uncached | Phase 1 |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Third-party API rate limits / breaking changes | Medium | High | Abstract all external APIs behind service layer; aggressive Redis caching |
| Fake seller registrations at scale | High | High | Email verification + admin review queue + AI fraud detection (Phase 5) |
| Search latency degradation at scale | Medium | High | Meilisearch Cloud + Redis caching + CDN for static assets |
| Seller adoption slower than projected | Medium | Medium | Incentive programme + simplified onboarding + seller success team |
| Review manipulation / fake ratings | High | Medium | Verified purchase badge + NLP scoring + rate limiting |
| Data breach / security incident | Low | Critical | Regular pen testing + encrypted secrets + incident response plan |
| Next.js 16 breaking API changes | Medium | Medium | Read `node_modules/next/dist/docs/` before implementation; pin version |
