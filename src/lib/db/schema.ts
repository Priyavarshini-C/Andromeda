// =============================================================================
// Andromeda — Drizzle ORM Schema (SQLite)
// Mirrors docs/schema.sql with SQLite-compatible types
// =============================================================================

import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Helper: generate UUID default
// ---------------------------------------------------------------------------
const uuid = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

// ---------------------------------------------------------------------------
// AUTH TABLES (NextAuth.js v5 / Auth.js adapter compatible)
// ---------------------------------------------------------------------------

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  // Andromeda extensions
  passwordHash: text("password_hash"),
  role: text("role", { enum: ["user", "seller", "admin"] })
    .notNull()
    .default("user"),
  phone: text("phone"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("accounts_provider_unique").on(
      table.provider,
      table.providerAccountId
    ),
  ]
);

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("verification_tokens_pkey").on(table.identifier, table.token),
  ]
);

// ---------------------------------------------------------------------------
// CORE DOMAIN: CATEGORIES
// ---------------------------------------------------------------------------

export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  description: text("description"),
  parentId: text("parent_id").references((): any => categories.id, {
    onDelete: "set null",
  }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: SELLERS
// ---------------------------------------------------------------------------

export const sellers = sqliteTable("sellers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  website: text("website"),
  addressLine1: text("address_line1"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  country: text("country").notNull().default("IN"),
  phone: text("phone"),
  email: text("email"),
  gstin: text("gstin"),
  status: text("status", {
    enum: ["pending", "active", "suspended", "rejected"],
  })
    .notNull()
    .default("pending"),
  isVerified: integer("is_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  productCount: integer("product_count").notNull().default(0),
  latitude: real("latitude"),
  longitude: real("longitude"),
  businessHours: text("business_hours"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: PRODUCTS
// ---------------------------------------------------------------------------

export const products = sqliteTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sellerId: text("seller_id")
    .notNull()
    .references(() => sellers.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDesc: text("short_desc"),
  images: text("images").notNull().default("[]"), // JSON array of URLs
  thumbnailUrl: text("thumbnail_url"),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  currency: text("currency", { enum: ["INR", "USD", "EUR"] })
    .notNull()
    .default("INR"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  specs: text("specs").notNull().default("{}"), // JSON object
  tags: text("tags").notNull().default("[]"), // JSON array
  brand: text("brand"),
  status: text("status", { enum: ["draft", "active", "hidden", "removed"] })
    .notNull()
    .default("draft"),
  isFeatured: integer("is_featured", { mode: "boolean" })
    .notNull()
    .default(false),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: REVIEWS
// ---------------------------------------------------------------------------

export const reviews = sqliteTable("reviews", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  isVerifiedPurchase: integer("is_verified_purchase", { mode: "boolean" })
    .notNull()
    .default(false),
  isFlagged: integer("is_flagged", { mode: "boolean" })
    .notNull()
    .default(false),
  helpfulCount: integer("helpful_count").notNull().default(0),
  unhelpfulCount: integer("unhelpful_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const reviewVotes = sqliteTable(
  "review_votes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reviewId: text("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isHelpful: integer("is_helpful", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("review_votes_unique").on(table.reviewId, table.userId),
  ]
);

// ---------------------------------------------------------------------------
// CORE DOMAIN: PRICE HISTORY
// ---------------------------------------------------------------------------

export const priceHistory = sqliteTable("price_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sellerId: text("seller_id").references(() => sellers.id, {
    onDelete: "set null",
  }),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("INR"),
  recordedAt: integer("recorded_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: WISHLISTS
// ---------------------------------------------------------------------------

export const wishlists = sqliteTable("wishlists", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  collectionName: text("collection_name").notNull().default("My Wishlist"),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: ALERTS
// ---------------------------------------------------------------------------

export const alerts = sqliteTable("alerts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  alertType: text("alert_type", { enum: ["price", "stock"] }).notNull(),
  targetPrice: real("target_price"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  triggerCount: integer("trigger_count").notNull().default(0),
  lastTriggeredAt: integer("last_triggered_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
