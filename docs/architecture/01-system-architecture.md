# Andromeda — System Architecture

> **Version:** 1.0 | **Status:** Draft | **Date:** June 2026

## 1. Overview

Andromeda is a **product discovery and comparison platform** that aggregates products from multiple marketplaces, local businesses, and independent sellers into a single unified interface. The architecture is designed around three core principles:

- **Search-first:** Every interaction starts with a search. Meilisearch is the spine of product discovery.
- **RSC-first rendering:** Next.js Server Components are the default; client interactivity is a deliberate opt-in.
- **Microservice seam:** Heavy-compute operations (search indexing, recommendations, analytics, notifications) are offloaded to a FastAPI microservice layer — keeping the Next.js layer lean and edge-deployable.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   Browser / Progressive Web App (mobile-first responsive)       │
│   320px → 768px → 1024px → 1280px → 1440px breakpoints         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / TLS 1.3
┌────────────────────────────▼────────────────────────────────────┐
│                      EDGE LAYER — Vercel                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          Next.js 16 — App Router (Server Components)    │   │
│  │                                                         │   │
│  │   Middleware ──► Auth check, RBAC, Rate limiting, CORS  │   │
│  │                                                         │   │
│  │   Route Groups:                                         │   │
│  │   (marketing) │ (auth) │ (dashboard) │ (seller) │ (admin)  │  │
│  │                                                         │   │
│  │   Route Handlers: /api/* — BFF for DB + microservices   │   │
│  │   Server Actions: All form mutations                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────┬────────────────────────────┬─────────────────────┘
               │ Internal HTTP              │ Internal HTTP
               │ (service token)            │ (service token)
┌──────────────▼───────────┐  ┌────────────▼────────────────────┐
│   DATA LAYER             │  │  MICROSERVICES — Railway/Render  │
│                          │  │                                  │
│  PostgreSQL 16 (Supabase)│  │  ┌──────────────────────────┐   │
│  ├── Primary OLTP store  │  │  │  Search Service (8001)   │   │
│  └── PostGIS extension   │  │  │  Meilisearch proxy +     │   │
│                          │  │  │  indexer webhook         │   │
│  Meilisearch Cloud       │  │  └──────────────────────────┘   │
│  └── Full-text search    │  │  ┌──────────────────────────┐   │
│                          │  │  │  Recommendations (8002)  │   │
│  Redis (Upstash)         │  │  │  Collaborative filtering │   │
│  ├── Session store       │  │  └──────────────────────────┘   │
│  ├── API response cache  │  │  ┌──────────────────────────┐   │
│  └── Rate limit counters │  │  │  Analytics Service (8003)│   │
│                          │  │  │  Aggregation + reporting │   │
│  Cloudinary / AWS S3     │  │  └──────────────────────────┘   │
│  └── Product images      │  │  ┌──────────────────────────┐   │
│      Seller media        │  │  │  Notifications (8004)    │   │
└──────────────────────────┘  │  │  Price drop / stock alert│   │
                              │  └──────────────────────────┘   │
┌─────────────────────────────┤  └────────────────────────────────┘
│  EXTERNAL SERVICES          │
│                             │
│  Google OAuth               │
│  Resend (transactional mail)│
│  Marketplace APIs (Phase 5) │
│  Sentry (error tracking)    │
└─────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| **Frontend Framework** | Next.js | 16.x (App Router) | Server Components, Server Actions, Parallel Routes |
| **Language** | TypeScript | 5.x | Strict mode throughout |
| **Styling** | Tailwind CSS | 4.x | Custom design tokens from Andromeda Discovery System |
| **UI Components** | shadcn/ui + Radix UI | Latest | Accessible, headless primitives |
| **State — Global UI** | Zustand | Latest | Compare list, sidebar, theme |
| **State — Server** | TanStack Query | v5 | Caching, background sync, optimistic updates |
| **Forms** | React Hook Form + Zod | Latest | Schema-first with type inference |
| **Animation** | Framer Motion | Latest | Page transitions, micro-interactions |
| **Icons** | Lucide React | Latest | Tree-shakable |
| **Backend API** | FastAPI (Python) | Latest | Async microservices |
| **ORM** | Drizzle ORM | Latest | Type-safe, Supabase-compatible |
| **Auth** | NextAuth.js v5 (Auth.js) | v5 | JWT + OAuth (Google); email/password |
| **Database (dev)** | SQLite | — | Zero-config local development |
| **Database (prod)** | PostgreSQL 16 | — | Supabase hosted |
| **Search** | Meilisearch | Cloud | Typo-tolerant, faceted filtering |
| **Cache / Session** | Redis | Upstash | Serverless Redis |
| **File Storage** | Cloudinary / AWS S3 | — | Product images, seller media |
| **Email** | Resend | — | Transactional mail |
| **Deployment (FE)** | Vercel | — | Edge functions, ISR, CDN |
| **Deployment (BE)** | Railway / Render | — | Containerised FastAPI |
| **CI/CD** | GitHub Actions | — | Lint → Test → Build → Deploy |
| **Monitoring** | Sentry + Vercel Analytics | — | Errors + Web Vitals |
| **Testing** | Vitest + Playwright | — | Unit, integration, E2E |

---

## 4. Rendering Strategy

| Page | Strategy | Revalidation | Rationale |
|---|---|---|---|
| Landing page | Static + ISR | 60s | SEO critical; content semi-dynamic |
| Category browse | ISR | 60s | SEO + product freshness balance |
| Product listing grid | ISR + Suspense streaming | 60s | Grid streams progressively |
| Product detail | Dynamic + Suspense | — | Price/stock must be real-time |
| Search results | Dynamic | — | Query-dependent, uncacheable |
| Compare page | Client-side | — | Fully interactive, ephemeral state |
| User dashboard | Dynamic + private | — | Auth-gated, personalised |
| Seller dashboard | Dynamic + private | — | Auth-gated, real-time metrics |
| Admin dashboard | Dynamic + private | — | Role-gated |

### RSC vs Client Component Rules

```
Default → React Server Component
  ├── Data fetching with native fetch() + Next.js cache tags
  ├── Static content: Navbar links, Footer, Breadcrumb, ProductGrid shell
  └── Dynamic server data: Product details, Category lists, Seller profiles

'use client' only for:
  ├── SearchBar (real-time autocomplete)
  ├── FilterPanel (interactive state)
  ├── CompareTable + CompareDrawer (Zustand state)
  ├── ReviewForm (form submission)
  ├── AlertModal (modal + form)
  ├── NearbyMap (Leaflet/browser APIs)
  └── Cart interactions
```

---

## 5. Authentication & Authorization

### Auth Flow

```
User visits protected route
        │
        ▼
Middleware reads session cookie / JWT header
        │
    ┌───┴─────────────────────────────────┐
    │ Token valid?                         │
    │                                     │
   YES                                   NO
    │                                     │
    ▼                                     ▼
Check user.role                    Redirect to /login
    │                              (with callbackUrl)
    ├── 'user'   → (dashboard) routes
    ├── 'seller' → (seller) routes + (dashboard)
    └── 'admin'  → (admin) + all routes
```

### Role-Based Access Control (RBAC)

| Role | Access |
|---|---|
| **Anonymous** | Browse, search, view products, compare |
| **user** | + Wishlist, cart, alerts, reviews, profile |
| **seller** | + Seller dashboard, product CRUD, analytics |
| **admin** | + Admin panel, moderation, platform analytics |

RBAC enforced at **two layers**:
1. **Next.js Middleware** — redirects at the edge before any component renders
2. **Route Handler / Server Action level** — re-validates session for every mutation

### JWT Configuration

```
Access token:  15 minutes
Refresh token: 7 days
Algorithm:     HS256 (internal); RS256 for microservice-to-microservice
```

---

## 6. Caching Architecture

```
Request for /products?category=electronics
          │
          ▼
   Next.js Cache (ISR)
   [tag: 'products', TTL: 60s]
          │
     Cache HIT? ──── YES ──► Return cached RSC payload
          │
         NO
          │
          ▼
   Redis Cache (Upstash)
   [key: 'products:electronics:p1', TTL: 60s]
          │
     Cache HIT? ──── YES ──► Return cached JSON
          │
         NO
          │
          ▼
   PostgreSQL (Supabase)
   [SELECT with optimised partial index]
          │
          ▼
   Store in Redis ──► Store in Next.js cache ──► Return response

Cache Invalidation:
  - Product updated → revalidateTag('products') via Server Action
  - Seller updated  → revalidateTag('sellers')
  - Category added  → revalidateTag('categories')
```

### Cache TTL Reference

| Data | Store | TTL |
|---|---|---|
| Category tree | Next.js + Redis | 3600s (1 hour) |
| Seller list | Next.js + Redis | 300s (5 min) |
| Product list | Next.js + Redis | 60s |
| Search results | Redis only | 60s |
| Product detail | Redis only | 120s |
| User session | Redis | 7 days |
| Rate limit counters | Redis | 60s |

---

## 7. Deployment Environments

| Environment | Frontend URL | Backend URL | Trigger |
|---|---|---|---|
| **Development** | `localhost:3000` | `localhost:8000` | `npm run dev` / `uvicorn` |
| **Preview** | `andromeda-[hash].vercel.app` | Railway preview service | PR opened/updated |
| **Staging** | `staging.andromeda.app` | Railway staging | Merge to `staging` branch |
| **Production** | `andromeda.app` | Railway production | Merge to `main` + manual gate |

---

## 8. Performance Targets (Core Web Vitals)

| Metric | Target | Page |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | All key pages |
| **INP** (Interaction to Next Paint) | < 200ms | All interactive pages |
| **CLS** (Cumulative Layout Shift) | < 0.1 | All pages |
| **TTFB** (Time to First Byte) | < 800ms | All pages |
| **Lighthouse Score** | > 90 | All key pages |
| **Initial JS Bundle** (gzipped) | < 150 KB | |
| **API response p95** | < 200ms cached / < 500ms uncached | |
| **Search response** | < 100ms | Via Meilisearch |

---

## 9. Security Architecture

| Concern | Implementation |
|---|---|
| **Auth tokens** | JWT (15-min access + 7-day refresh); HttpOnly cookies |
| **Input validation** | Zod schemas on all Server Actions and Route Handlers |
| **SQL injection** | Parameterised queries via Drizzle ORM |
| **XSS** | React default escaping + Content Security Policy headers |
| **CORS** | Restricted to Andromeda-owned domains |
| **Rate limiting** | Redis-backed; 100 req/min search, 20 req/min writes |
| **Secrets management** | Vercel Environment Variables + Doppler; never committed |
| **Dependency scanning** | GitHub Dependabot; patches within 48 hours |
| **Data encryption** | HTTPS/TLS 1.3; Supabase encryption at rest |
| **GDPR** | User data export + account deletion endpoints |
| **Seller verification** | Admin review queue; email verification required |
| **Review fraud** | NLP heuristics + velocity checks via FastAPI |

---

## 10. CI/CD Pipeline (GitHub Actions)

```
Push / PR opened
      │
      ▼
① ESLint + TypeScript type check (tsc --noEmit)
      │
      ▼
② Vitest — unit + integration tests (coverage report)
      │
      ▼
③ next build — verify build completes without errors
      │
      ▼
④ Vercel preview deployment (unique URL per PR)
      │
      ▼
⑤ Playwright E2E tests against preview URL
      │
      ▼
⑥ Lighthouse CI — all key pages; fail if score < 85
      │
      ▼
⑦ Manual approval gate ──── APPROVED ────►
      │
      ▼
⑧ Deploy to Vercel (Next.js) + Railway (FastAPI)
      │
      ▼
⑨ Post-deploy smoke tests (critical paths)
      │
      ▼
⑩ Sentry release created + Vercel Analytics updated
```

---

## 11. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Scalability** | 10,000+ concurrent users without degradation |
| **Catalogue size** | 10M+ product records |
| **Availability** | 99.9% uptime SLA (< 45 min downtime/month) |
| **Accessibility** | WCAG 2.1 Level AA; keyboard navigable; screen-reader friendly |
| **SEO** | Metadata API, OG tags, JSON-LD structured data on all public pages |
| **Internationalisation** | INR default; USD and EUR planned for Phase 2 |
| **Mobile** | Responsive: 320px, 768px, 1024px, 1440px breakpoints |
