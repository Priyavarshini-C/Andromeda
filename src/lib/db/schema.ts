// =============================================================================
// Andromeda — Drizzle ORM Schema (PostgreSQL / Supabase)
// =============================================================================

import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  boolean,
  uniqueIndex,
  primaryKey,
  pgEnum,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// ENUMS (Supabase / Postgres compatibility)
// ---------------------------------------------------------------------------
export const roleEnum = pgEnum("user_role", ["user", "seller", "admin"]);
export const alertTypeEnum = pgEnum("alert_type", ["price", "stock"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);
export const sellerStatusEnum = pgEnum("seller_status", [
  "pending",
  "active",
  "suspended",
  "rejected",
]);
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "hidden",
  "removed",
]);
export const currencyEnum = pgEnum("currency_code", ["INR", "USD", "EUR"]);

// Helper: UUID primary key generator
const pkUuid = (name: string = "id") =>
  text(name)
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

// ---------------------------------------------------------------------------
// AUTH TABLES
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  // Andromeda extensions
  passwordHash: text("password_hash"),
  role: roleEnum("role").notNull().default("user"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const accounts = pgTable(
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
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("accounts_provider_unique").on(
      table.provider,
      table.providerAccountId
    ),
  ]
);

export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("verification_tokens_pkey").on(table.identifier, table.token),
  ]
);

// ---------------------------------------------------------------------------
// CORE DOMAIN: CATEGORIES
// ---------------------------------------------------------------------------
export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  description: text("description"),
  parentId: text("parent_id").references((): AnyPgColumn => categories.id, {
    onDelete: "set null",
  }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: SELLERS
// ---------------------------------------------------------------------------
export const sellers = pgTable("sellers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull().default("direct"), // direct | website
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
  gstUrl: text("gst_url"),
  status: sellerStatusEnum("status").notNull().default("pending"),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at", { mode: "date" }),
  rating: doublePrecision("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  productCount: integer("product_count").notNull().default(0),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  businessHours: text("business_hours"), // JSON string
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: PRODUCTS
// ---------------------------------------------------------------------------
export const products = pgTable("products", {
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
  images: text("images").notNull().default("[]"), // JSON string representing image array
  thumbnailUrl: text("thumbnail_url"),
  price: doublePrecision("price").notNull(),
  originalPrice: doublePrecision("original_price"),
  currency: currencyEnum("currency").notNull().default("INR"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  specs: text("specs").notNull().default("{}"), // JSON specs object
  tags: text("tags").notNull().default("[]"), // JSON array of tags
  brand: text("brand"),
  status: productStatusEnum("status").notNull().default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: doublePrecision("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: REVIEWS
// ---------------------------------------------------------------------------
export const reviews = pgTable("reviews", {
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
  images: text("images").notNull().default("[]"),
  isVerifiedPurchase: boolean("is_verified_purchase")
    .notNull()
    .default(false),
  isFlagged: boolean("is_flagged").notNull().default(false),
  helpfulCount: integer("helpful_count").notNull().default(0),
  unhelpfulCount: integer("unhelpful_count").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const reviewVotes = pgTable(
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
    isHelpful: boolean("is_helpful").notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("review_votes_unique").on(table.reviewId, table.userId),
  ]
);

// ---------------------------------------------------------------------------
// CORE DOMAIN: PRICE HISTORY
// ---------------------------------------------------------------------------
export const priceHistory = pgTable("price_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sellerId: text("seller_id").references(() => sellers.id, {
    onDelete: "set null",
  }),
  price: doublePrecision("price").notNull(),
  currency: currencyEnum("currency").notNull().default("INR"),
  recordedAt: timestamp("recorded_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: WISHLISTS
// ---------------------------------------------------------------------------
export const wishlists = pgTable("wishlists", {
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
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: ALERTS
// ---------------------------------------------------------------------------
export const alerts = pgTable("alerts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  alertType: alertTypeEnum("alert_type").notNull(),
  targetPrice: doublePrecision("target_price"),
  isActive: boolean("is_active").notNull().default(true),
  triggerCount: integer("trigger_count").notNull().default(0),
  lastTriggeredAt: timestamp("last_triggered_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// CORE DOMAIN: COMPARISONS
// ---------------------------------------------------------------------------
export const comparisons = pgTable("comparisons", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull(),
  userId: text("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  productIds: text("product_ids").notNull(), // JSON string representing array of product UUIDs
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// NEW CORE DOMAIN: SHOPPING CARTS
// ---------------------------------------------------------------------------
export const carts = pgTable("carts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// NEW CORE DOMAIN: ORDERS & ORDER ITEMS
// ---------------------------------------------------------------------------
export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  sellerId: text("seller_id")
    .notNull()
    .references(() => sellers.id, { onDelete: "restrict" }),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  subtotal: doublePrecision("subtotal").notNull(),
  discountAmount: doublePrecision("discount_amount").notNull().default(0),
  shippingAmount: doublePrecision("shipping_amount").notNull().default(0),
  taxAmount: doublePrecision("tax_amount").notNull().default(0),
  totalAmount: doublePrecision("total_amount").notNull(),
  currency: currencyEnum("currency").notNull().default("INR"),
  shippingAddress: text("shipping_address").notNull(), // JSON snapshot string
  trackingNumber: text("tracking_number"),
  estimatedDelivery: timestamp("estimated_delivery", { mode: "date" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  productTitle: text("product_title").notNull(),
  productImage: text("product_image"),
  productSku: text("product_sku"),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// NEW CORE DOMAIN: SELLER DAILY ANALYTICS (Aggregated)
// ---------------------------------------------------------------------------
export const sellerAnalytics = pgTable(
  "seller_analytics",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sellerId: text("seller_id")
      .notNull()
      .references(() => sellers.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // format YYYY-MM-DD
    productViews: integer("product_views").notNull().default(0),
    searchClicks: integer("search_clicks").notNull().default(0),
    profileViews: integer("profile_views").notNull().default(0),
    wishlistAdds: integer("wishlist_adds").notNull().default(0),
    ordersCount: integer("orders_count").notNull().default(0),
    revenue: doublePrecision("revenue").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("seller_analytics_seller_date").on(table.sellerId, table.date),
  ]
);

// ---------------------------------------------------------------------------
// NEW CORE DOMAIN: NOTIFICATIONS
// ---------------------------------------------------------------------------
export const notifications = pgTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("general"), // general | price_drop | wishlist | order
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});
