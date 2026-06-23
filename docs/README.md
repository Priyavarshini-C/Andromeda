# Andromeda — Architecture Documentation

> **Product:** Andromeda — Product Discovery & Comparison Platform
> **Tagline:** "One Search. Infinite Choices."
> **Version:** 1.0 | **Date:** June 2026 | **Status:** Draft

---

## Documents

| # | Document | Description |
|---|---|---|
| 1 | [System Architecture](./architecture/01-system-architecture.md) | High-level design, tech stack, rendering strategy, auth, caching, CI/CD, performance targets, security |
| 2 | [Database Schema](./architecture/02-database-schema.md) | All tables, relationships, constraints, indexes, triggers, RLS policies |
| 3 | [Backend Architecture](./architecture/03-backend-architecture.md) | Next.js Route Handlers (BFF), Server Actions, FastAPI microservices, Drizzle ORM, background jobs |
| 4 | [Frontend Architecture](./architecture/04-frontend-architecture.md) | App Router structure, component library, design system tokens, state management, testing |
| 5 | [API Specification](./architecture/05-api-specification.md) | All REST endpoints with request/response schemas, auth requirements, rate limits |
| 6 | [Development Roadmap](./architecture/06-development-roadmap.md) | Phased sprint plan across 12+ months with task breakdown, KPIs, risk register |

### Supporting files

- [docs/schema.sql](./schema.sql) — Canonical PostgreSQL schema (raw SQL reference for Drizzle ORM)

---

## Tech Stack Summary

```
Frontend:   Next.js 16 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Zustand · TanStack Query v5
Backend:    FastAPI (Python) · Drizzle ORM · NextAuth.js v5
Database:   PostgreSQL 16 (Supabase) · Meilisearch · Redis (Upstash)
Storage:    Cloudinary / AWS S3
Email:      Resend
Deployment: Vercel (FE) · Railway (BE) · GitHub Actions (CI/CD)
Monitoring: Sentry · Vercel Analytics
Testing:    Vitest · Playwright · Lighthouse CI
```

---

## Quick Reference

### User Roles
`anonymous` → `user` → `seller` → `admin`

### Phase Summary
| Phase | Months | Milestone |
|---|---|---|
| 1 — MVP | 1–3 | Search · Browse · Compare · Auth |
| 2 — Enhanced | 4–6 | Wishlist · Cart · Alerts · Reviews · Sellers |
| 3 — Smart | 7–9 | AI Recommendations · Personalisation |
| 4 — Local | 9–12 | Geo discovery · Local seller marketplace |
| 5 — Scale | Post-launch | Analytics · Fraud detection · Global markets |

### Key URLs (Production)
```
Frontend:   https://andromeda.app
API:        https://andromeda.app/api
Staging:    https://staging.andromeda.app
```

### Performance Targets
| Metric | Target |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Search response | < 100ms |
| Lighthouse score | > 90 |
