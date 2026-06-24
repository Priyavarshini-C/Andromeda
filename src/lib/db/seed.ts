// =============================================================================
// Andromeda — Database Seed Script
// Run with: npx tsx src/lib/db/seed.ts
// =============================================================================

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { hashSync } from "bcryptjs";
import * as schema from "./schema";
import path from "path";

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), "andromeda.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

// ---------------------------------------------------------------------------
// Create tables (inline DDL since we're not using drizzle-kit push for seed)
// ---------------------------------------------------------------------------

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    email_verified INTEGER,
    image TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    phone TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS accounts_provider_unique ON accounts(provider, provider_account_id);

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires INTEGER NOT NULL,
    PRIMARY KEY (identifier, token)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sellers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    website TEXT,
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    country TEXT NOT NULL DEFAULT 'IN',
    phone TEXT,
    email TEXT,
    gstin TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    is_verified INTEGER NOT NULL DEFAULT 0,
    verified_at INTEGER,
    rating REAL NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    product_count INTEGER NOT NULL DEFAULT 0,
    latitude REAL,
    longitude REAL,
    business_hours TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_desc TEXT,
    images TEXT NOT NULL DEFAULT '[]',
    thumbnail_url TEXT,
    price REAL NOT NULL,
    original_price REAL,
    currency TEXT NOT NULL DEFAULT 'INR',
    stock INTEGER NOT NULL DEFAULT 0,
    sku TEXT,
    specs TEXT NOT NULL DEFAULT '{}',
    tags TEXT NOT NULL DEFAULT '[]',
    brand TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    is_featured INTEGER NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    is_verified_purchase INTEGER NOT NULL DEFAULT 0,
    is_flagged INTEGER NOT NULL DEFAULT 0,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    unhelpful_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS review_votes (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_helpful INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS review_votes_unique ON review_votes(review_id, user_id);

  CREATE TABLE IF NOT EXISTS price_history (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id TEXT REFERENCES sellers(id) ON DELETE SET NULL,
    price REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    recorded_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    collection_name TEXT NOT NULL DEFAULT 'My Wishlist',
    note TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    target_price REAL,
    is_active INTEGER NOT NULL DEFAULT 1,
    trigger_count INTEGER NOT NULL DEFAULT 0,
    last_triggered_at INTEGER,
    created_at INTEGER NOT NULL
  );
`);

console.log("✅ Tables created");

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const now = new Date();
const ts = Math.floor(now.getTime() / 1000);

// --- Demo users (seller accounts) ---
const demoPassword = hashSync("password123", 10);

const userIds = {
  admin: crypto.randomUUID(),
  buyer: crypto.randomUUID(),
  seller1: crypto.randomUUID(),
  seller2: crypto.randomUUID(),
  seller3: crypto.randomUUID(),
  seller4: crypto.randomUUID(),
  seller5: crypto.randomUUID(),
  seller6: crypto.randomUUID(),
  seller7: crypto.randomUUID(),
  seller8: crypto.randomUUID(),
  seller9: crypto.randomUUID(),
  seller10: crypto.randomUUID(),
  reviewer1: crypto.randomUUID(),
  reviewer2: crypto.randomUUID(),
  reviewer3: crypto.randomUUID(),
  reviewer4: crypto.randomUUID(),
  reviewer5: crypto.randomUUID(),
  reviewer6: crypto.randomUUID(),
  reviewer7: crypto.randomUUID(),
  reviewer8: crypto.randomUUID(),
};

const insertUser = sqlite.prepare(
  `INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
);

const insertMany = sqlite.transaction(() => {
  insertUser.run(userIds.admin, "Admin", "admin@andromeda.app", demoPassword, "admin", ts, ts);
  insertUser.run(userIds.buyer, "Demo User", "user@andromeda.app", demoPassword, "user", ts, ts);
  insertUser.run(userIds.seller1, "AstroMarket Owner", "seller1@andromeda.app", demoPassword, "seller", ts, ts);
  insertUser.run(userIds.seller2, "Galaxy Retailers Owner", "seller2@andromeda.app", demoPassword, "seller", ts, ts);
  insertUser.run(userIds.seller3, "StarShop Owner", "seller3@andromeda.app", demoPassword, "seller", ts, ts);
  insertUser.run(userIds.seller4, "Sonic Hub Owner", "seller4@andromeda.app", demoPassword, "seller", ts, ts);
  insertUser.run(userIds.seller5, "Home Planet Owner", "seller5@andromeda.app", demoPassword, "seller", ts, ts);
  insertUser.run(userIds.seller6, "Kitchen Tech Owner", "seller6@andromeda.app", demoPassword, "seller", ts, ts);
  insertUser.run(userIds.seller7, "CosmoBooks Owner", "seller7@andromeda.app", demoPassword, "seller", ts, ts);
  insertUser.run(userIds.seller8, "Universal Book Store Owner", "seller8@andromeda.app", demoPassword, "seller", ts, ts);
  insertUser.run(userIds.seller9, "AeroSport Owner", "seller9@andromeda.app", demoPassword, "seller", ts, ts);
  insertUser.run(userIds.seller10, "Sprint Hub Owner", "seller10@andromeda.app", demoPassword, "seller", ts, ts);

  // Reviewer users
  insertUser.run(userIds.reviewer1, "Aditya K.", "aditya@example.com", demoPassword, "user", ts, ts);
  insertUser.run(userIds.reviewer2, "Priya S.", "priya.s@example.com", demoPassword, "user", ts, ts);
  insertUser.run(userIds.reviewer3, "Rohit M.", "rohit@example.com", demoPassword, "user", ts, ts);
  insertUser.run(userIds.reviewer4, "Ananya B.", "ananya@example.com", demoPassword, "user", ts, ts);
  insertUser.run(userIds.reviewer5, "Gaurav R.", "gaurav@example.com", demoPassword, "user", ts, ts);
  insertUser.run(userIds.reviewer6, "Neha J.", "neha@example.com", demoPassword, "user", ts, ts);
  insertUser.run(userIds.reviewer7, "Amit P.", "amit@example.com", demoPassword, "user", ts, ts);
  insertUser.run(userIds.reviewer8, "Vikram R.", "vikram@example.com", demoPassword, "user", ts, ts);
});

insertMany();
console.log("✅ Users seeded");

// --- Sellers ---
const sellerIds: Record<string, string> = {};
const insertSeller = sqlite.prepare(
  `INSERT OR IGNORE INTO sellers (id, user_id, business_name, slug, description, address_line1, city, state, pincode, status, is_verified, rating, review_count, product_count, country, latitude, longitude, business_hours, phone, email, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, 0, 0, 'IN', ?, ?, ?, ?, ?, ?, ?)`
);

const sellerData = [
  { key: "sell-1", userId: userIds.seller1, name: "AstroMarket", slug: "astromarket", desc: "Premium electronics & gadgets. Authorized dealer for top brands.", address: "42 MG Road, Brigade Gateway", city: "Bengaluru", state: "Karnataka", pincode: "560001", verified: 1, rating: 4.7, lat: 12.9716, lng: 77.5946, hours: '{"mon-sat": "10:00-21:00", "sun": "11:00-19:00"}', phone: "+91 80 4567 1234", email: "contact@astromarket.in" },
  { key: "sell-2", userId: userIds.seller2, name: "Galaxy Retailers", slug: "galaxy-retailers", desc: "India's trusted multi-category retailer. Best prices, genuine products.", address: "15 Anna Salai, T. Nagar", city: "Chennai", state: "Tamil Nadu", pincode: "600017", verified: 1, rating: 4.9, lat: 13.0827, lng: 80.2707, hours: '{"mon-sat": "09:30-21:30", "sun": "10:00-20:00"}', phone: "+91 44 2834 5678", email: "hello@galaxyretailers.in" },
  { key: "sell-3", userId: userIds.seller3, name: "StarShop Electronics", slug: "starshop-electronics", desc: "Your neighbourhood electronics expert. Competitive prices on all gadgets.", address: "78 FC Road, Shivajinagar", city: "Pune", state: "Maharashtra", pincode: "411005", verified: 0, rating: 4.2, lat: 18.5204, lng: 73.8567, hours: '{"mon-sat": "10:00-20:30", "sun": "closed"}', phone: "+91 20 2567 8901", email: "sales@starshop.in" },
  { key: "sell-4", userId: userIds.seller4, name: "Sonic Hub", slug: "sonic-hub", desc: "Audio specialists — headphones, speakers, and sound systems.", address: "22 Linking Road, Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050", verified: 1, rating: 4.6, lat: 19.0596, lng: 72.8295, hours: '{"mon-sat": "11:00-22:00", "sun": "12:00-20:00"}', phone: "+91 22 2645 3456", email: "support@sonichub.in" },
  { key: "sell-5", userId: userIds.seller5, name: "Home Planet", slug: "home-planet", desc: "Premium home appliances and kitchen solutions for modern living.", address: "5 Park Street, Elgin", city: "Kolkata", state: "West Bengal", pincode: "700016", verified: 1, rating: 4.5, lat: 22.5726, lng: 88.3639, hours: '{"mon-sat": "10:00-20:00", "sun": "11:00-18:00"}', phone: "+91 33 2229 0123", email: "info@homeplanet.in" },
  { key: "sell-6", userId: userIds.seller6, name: "Kitchen Tech", slug: "kitchen-tech", desc: "Smart kitchen appliances and cookware for the modern chef.", address: "101 Connaught Place, Block A", city: "New Delhi", state: "Delhi", pincode: "110001", verified: 0, rating: 4.0, lat: 28.6139, lng: 77.2090, hours: '{"mon-sat": "10:30-21:00", "sun": "11:00-19:00"}', phone: "+91 11 2341 5678", email: "orders@kitchentech.in" },
  { key: "sell-7", userId: userIds.seller7, name: "CosmoBooks", slug: "cosmobooks", desc: "Curated book collections — bestsellers, classics, and rare finds.", address: "33 Church Street, Ashok Nagar", city: "Bengaluru", state: "Karnataka", pincode: "560001", verified: 1, rating: 4.8, lat: 12.9750, lng: 77.6040, hours: '{"mon-sat": "09:00-21:00", "sun": "10:00-20:00"}', phone: "+91 80 2558 9012", email: "hello@cosmobooks.in" },
  { key: "sell-8", userId: userIds.seller8, name: "Universal Book Store", slug: "universal-book-store", desc: "Books for every reader — academic, fiction, non-fiction, and children's.", address: "67 Abids Road, Koti", city: "Hyderabad", state: "Telangana", pincode: "500001", verified: 0, rating: 4.4, lat: 17.3850, lng: 78.4867, hours: '{"mon-sat": "09:30-20:30", "sun": "10:00-18:00"}', phone: "+91 40 2345 6789", email: "read@universalbooks.in" },
  { key: "sell-9", userId: userIds.seller9, name: "AeroSport Official", slug: "aerosport-official", desc: "Official sportswear and athletic gear. Performance meets style.", address: "12 CG Road, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", verified: 1, rating: 4.9, lat: 23.0225, lng: 72.5714, hours: '{"mon-sat": "10:00-21:00", "sun": "10:00-20:00"}', phone: "+91 79 2656 7890", email: "shop@aerosport.in" },
  { key: "sell-10", userId: userIds.seller10, name: "Sprint Hub", slug: "sprint-hub", desc: "Fitness gear, sportswear, and outdoor equipment for every adventure.", address: "89 MI Road, C-Scheme", city: "Jaipur", state: "Rajasthan", pincode: "302001", verified: 0, rating: 4.3, lat: 26.9124, lng: 75.7873, hours: '{"mon-sat": "10:00-20:30", "sun": "11:00-19:00"}', phone: "+91 141 237 1234", email: "contact@sprinthub.in" },
];

const seedSellers = sqlite.transaction(() => {
  for (const s of sellerData) {
    const id = crypto.randomUUID();
    sellerIds[s.key] = id;
    insertSeller.run(id, s.userId, s.name, s.slug, s.desc, s.address, s.city, s.state, s.pincode, s.verified, s.rating, s.lat, s.lng, s.hours, s.phone, s.email, ts, ts);
  }
});
seedSellers();
console.log("✅ Sellers seeded");

// --- Categories ---
const categoryIds: Record<string, string> = {};
const insertCategory = sqlite.prepare(
  `INSERT OR IGNORE INTO categories (id, name, slug, icon, sort_order, is_active, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
);

const categoryData = [
  { key: "cat-1", name: "Electronics", slug: "electronics", icon: "Laptop", order: 1 },
  { key: "cat-2", name: "Home & Kitchen", slug: "home-kitchen", icon: "Home", order: 2 },
  { key: "cat-3", name: "Books", slug: "books", icon: "BookOpen", order: 3 },
  { key: "cat-4", name: "Fashion", slug: "fashion", icon: "Shirt", order: 4 },
];

const seedCategories = sqlite.transaction(() => {
  for (const c of categoryData) {
    const id = crypto.randomUUID();
    categoryIds[c.key] = id;
    insertCategory.run(id, c.name, c.slug, c.icon, c.order, ts, ts);
  }
});
seedCategories();
console.log("✅ Categories seeded");

// --- Products ---
// Each product from the original mock data, assigned to the FIRST seller in its sellers list
const productIds: Record<string, string> = {};
const insertProduct = sqlite.prepare(
  `INSERT OR IGNORE INTO products (id, seller_id, category_id, title, slug, description, images, thumbnail_url, price, original_price, currency, stock, specs, tags, brand, status, is_featured, rating, review_count, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, '[]', ?, 'active', ?, ?, ?, ?, ?)`
);

interface ProductSeed {
  key: string;
  sellerId: string;
  categoryKey: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  originalPrice: number;
  stock: number;
  specs: Record<string, string>;
  brand: string;
  featured: boolean;
  rating: number;
  reviewCount: number;
}

const productData: ProductSeed[] = [
  {
    key: "prod-1",
    sellerId: "sell-1",
    categoryKey: "cat-1",
    title: "Nebula X1 Pro Smartphone",
    slug: "nebula-x1-pro-smartphone",
    description: "Experience the next frontier of mobile performance. The Nebula X1 Pro features a stunning 120Hz AMOLED display, the latest Kepler octa-core processor, and a quad-lens observatory camera system designed to capture the universe in spectacular detail.",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
    ],
    price: 64999,
    originalPrice: 74999,
    stock: 45,
    specs: {
      "Display": "6.7-inch AMOLED, 120Hz, HDR10+",
      "Processor": "Kepler 900 Octa-Core (4nm)",
      "RAM": "12GB LPDDR5X",
      "Storage": "256GB UFS 4.0",
      "Battery": "5000 mAh with 100W StarCharge",
      "OS": "Andromeda OS (based on Android 15)"
    },
    brand: "CosmicTech",
    featured: true,
    rating: 4.8,
    reviewCount: 3,
  },
  {
    key: "prod-2",
    sellerId: "sell-4",
    categoryKey: "cat-1",
    title: "Nova Sound ANC Wireless Headphones",
    slug: "nova-sound-anc-headphones",
    description: "Tune out the world and lose yourself in audio clarity. The Nova Sound Wireless Headphones offer industry-leading Active Noise Cancellation, custom 40mm aerospace drivers, and up to 50 hours of wireless playback.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
    ],
    price: 14999,
    originalPrice: 19999,
    stock: 82,
    specs: {
      "Driver Size": "40mm Custom Dynamic",
      "Noise Cancelling": "Adaptive Hybrid ANC (up to 42dB)",
      "Battery Life": "50 Hours (ANC Off) / 38 Hours (ANC On)",
      "Bluetooth Version": "Bluetooth 5.4 with Multipoint Connect",
      "Weight": "250g",
      "Codec Support": "AAC, LDAC, SBC"
    },
    brand: "AeroAcoustics",
    featured: true,
    rating: 4.6,
    reviewCount: 2,
  },
  {
    key: "prod-3",
    sellerId: "sell-2",
    categoryKey: "cat-2",
    title: "Cosmic Brew Smart Coffee Maker",
    slug: "cosmic-brew-coffee-maker",
    description: "Wake up to the aroma of freshly ground, perfectly brewed coffee programmed right from your smartphone. The Cosmic Brew Coffee Maker combines precision temperature control, an integrated conical burr grinder, and scheduling options.",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80"
    ],
    price: 8999,
    originalPrice: 11999,
    stock: 22,
    specs: {
      "Capacity": "12 Cups (1.8 Litres)",
      "Grinder": "Conical Burr Grinder (8 coarseness settings)",
      "Pump Pressure": "15 Bar Italian Pump",
      "Connectivity": "Wi-Fi 2.4GHz & Bluetooth (iOS/Android App)",
      "Heating System": "ThermoBlock Rapid Heating"
    },
    brand: "Kepler Home",
    featured: true,
    rating: 4.4,
    reviewCount: 2,
  },
  {
    key: "prod-4",
    sellerId: "sell-7",
    categoryKey: "cat-3",
    title: "Andromeda Astronomy Guidebook",
    slug: "andromeda-astronomy-guidebook",
    description: "The ultimate visual encyclopedia and field manual for observing the cosmos. Written by leading astrophysicists, this comprehensive book contains sky maps, coordinates for stargazing, and full-color space telescope photographs.",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
    ],
    price: 1299,
    originalPrice: 1599,
    stock: 120,
    specs: {
      "Format": "Hardcover, Special Edition",
      "Pages": "384 Pages",
      "Language": "English",
      "Dimensions": "20.3 x 3.2 x 25.4 cm",
      "Publisher": "Nebula Press (April 2025)"
    },
    brand: "Nebula Press",
    featured: true,
    rating: 4.9,
    reviewCount: 1,
  },
  {
    key: "prod-5",
    sellerId: "sell-2",
    categoryKey: "cat-4",
    title: "Solar Flare Lightweight Running Shoes",
    slug: "solar-flare-running-shoes",
    description: "Ignite your speed with Solar Flare. Engineered with hyper-reactive carbon-fiber plating and nitrogen-infused foam mid-soles, these shoes provide maximum energy return and spring with each stride.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"
    ],
    price: 7999,
    originalPrice: 9999,
    stock: 35,
    specs: {
      "Type": "Road Running, Performance Racing",
      "Midsole": "Helios Nitrogen Foam + Full-length Carbon Plate",
      "Arch Support": "Neutral",
      "Drop": "8mm",
      "Weight": "195g (Size 9)"
    },
    brand: "AeroSport",
    featured: false,
    rating: 4.5,
    reviewCount: 2,
  },
];

const seedProducts = sqlite.transaction(() => {
  for (const p of productData) {
    const id = crypto.randomUUID();
    productIds[p.key] = id;
    insertProduct.run(
      id,
      sellerIds[p.sellerId],
      categoryIds[p.categoryKey],
      p.title,
      p.slug,
      p.description,
      JSON.stringify(p.images),
      p.images[0] || null,
      p.price,
      p.originalPrice,
      p.stock,
      JSON.stringify(p.specs),
      p.brand,
      p.featured ? 1 : 0,
      p.rating,
      p.reviewCount,
      ts,
      ts
    );
  }
});
seedProducts();
console.log("✅ Products seeded");

// --- Price History ---
const insertPH = sqlite.prepare(
  `INSERT INTO price_history (id, product_id, seller_id, price, currency, recorded_at)
   VALUES (?, ?, ?, ?, 'INR', ?)`
);

const monthOffsets = [
  { label: "Jan", offset: -5 },
  { label: "Feb", offset: -4 },
  { label: "Mar", offset: -3 },
  { label: "Apr", offset: -2 },
  { label: "May", offset: -1 },
  { label: "Jun", offset: 0 },
];

const priceHistoryData: Record<string, number[]> = {
  "prod-1": [72000, 71500, 69999, 68000, 66000, 64999],
  "prod-2": [18000, 17500, 16999, 15999, 15499, 14999],
  "prod-3": [10999, 10999, 9999, 9499, 8999, 8999],
  "prod-4": [1499, 1450, 1399, 1299, 1299, 1299],
  "prod-5": [9500, 9000, 8500, 8200, 7999, 7999],
};

const seedPriceHistory = sqlite.transaction(() => {
  for (const [prodKey, prices] of Object.entries(priceHistoryData)) {
    const prodId = productIds[prodKey];
    // Get the first seller for this product
    const firstSellerKey = productData.find(p => p.key === prodKey)?.sellerId;
    const sid = firstSellerKey ? sellerIds[firstSellerKey] : null;

    for (let i = 0; i < prices.length; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + monthOffsets[i].offset);
      const recordedTs = Math.floor(d.getTime() / 1000);
      insertPH.run(crypto.randomUUID(), prodId, sid, prices[i], recordedTs);
    }
  }
});
seedPriceHistory();
console.log("✅ Price history seeded");

// --- Reviews ---
const insertReview = sqlite.prepare(
  `INSERT INTO reviews (id, product_id, user_id, rating, title, content, is_verified_purchase, helpful_count, unhelpful_count, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`
);

const reviewData = [
  { productKey: "prod-1", userId: userIds.reviewer1, rating: 5, content: "Absolutely brilliant phone! Camera quality is stellar, and screen transitions are smooth like butter.", verified: 1 },
  { productKey: "prod-1", userId: userIds.reviewer2, rating: 4, content: "Excellent display and build quality. The battery lasts well over a day. Deducted one star because the charger is sold separately by some vendors.", verified: 1 },
  { productKey: "prod-1", userId: userIds.reviewer3, rating: 5, content: "Astrophotography mode works like a charm! Highly recommended for star gazers.", verified: 0 },
  { productKey: "prod-2", userId: userIds.reviewer4, rating: 5, content: "Noise cancellation is amazing, silences everything on my metro rides! Sound quality is clear and balanced.", verified: 1 },
  { productKey: "prod-2", userId: userIds.reviewer5, rating: 4, content: "Sound is top-notch. Build is sturdy. It gets slightly warm on the ears after 3-4 hours of continuous usage.", verified: 1 },
  { productKey: "prod-3", userId: userIds.reviewer6, rating: 5, content: "I can trigger my morning coffee right from my bed. The app is intuitive and the coffee taste is amazing.", verified: 1 },
  { productKey: "prod-3", userId: userIds.reviewer7, rating: 3, content: "Great coffee but cleaning the grinder takes time. App disconnected once and had to reset.", verified: 1 },
  { productKey: "prod-4", userId: userIds.reviewer8, rating: 5, content: "Breathtaking images and incredibly simple instructions. Even a beginner like me was able to locate nebula formations.", verified: 1 },
  { productKey: "prod-5", userId: userIds.reviewer1, rating: 5, content: "I set a personal record in my 10k race wearing these! Super springy and feels like running on air.", verified: 1 },
  { productKey: "prod-5", userId: userIds.reviewer4, rating: 4, content: "Very comfortable and light. Sizes run slightly small so order half a size up.", verified: 0 },
];

const seedReviews = sqlite.transaction(() => {
  for (const r of reviewData) {
    insertReview.run(
      crypto.randomUUID(),
      productIds[r.productKey],
      r.userId,
      r.rating,
      null,
      r.content,
      r.verified,
      ts,
      ts
    );
  }
});
seedReviews();
console.log("✅ Reviews seeded");

// Update product_count on sellers
sqlite.exec(`
  UPDATE sellers SET product_count = (
    SELECT COUNT(*) FROM products WHERE products.seller_id = sellers.id
  );
`);

console.log("✅ Seller product counts updated");
console.log("\n🚀 Database seeded successfully!");
console.log("   Demo accounts:");
console.log("   - Admin:  admin@andromeda.app / password123");
console.log("   - User:   user@andromeda.app  / password123");
console.log("   - Seller: seller1@andromeda.app / password123");
console.log(`\n   Database file: ${DB_PATH}`);

sqlite.close();
