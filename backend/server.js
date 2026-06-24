// =============================================================================
// Andromeda — Standalone Express.js Backend Server (Port 8000)
// =============================================================================
// Run with: node backend/server.js
// Base URL:  http://localhost:8000
// =============================================================================

require("dotenv").config({ path: ".env.local" });
const express = require("express");
const cors = require("cors");
const postgres = require("postgres");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ── Database Connection ──────────────────────────────────────────────────────
const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
});

// ── Root ─────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    name: "Andromeda Backend API",
    version: "1.0.0",
    status: "running",
    database: "Supabase PostgreSQL",
    endpoints: [
      "GET  /api/health",
      "GET  /api/users",
      "GET  /api/users/:id",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET  /api/products",
      "GET  /api/products/:slug",
      "GET  /api/categories",
      "GET  /api/sellers",
      "GET  /api/sellers/:id",
      "GET  /api/orders",
      "GET  /api/stats",
    ],
  });
});

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ status: "ok", database: "connected", timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected", error: err.message });
  }
});

// ── USERS ────────────────────────────────────────────────────────────────────
app.get("/api/users", async (req, res) => {
  try {
    const users = await sql`
      SELECT id, name, email, role, is_active, created_at
      FROM users ORDER BY created_at DESC
    `;
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, name, email, role, is_active, created_at
      FROM users WHERE id = ${req.params.id}
    `;
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── AUTH ─────────────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email, and password are required" });

  try {
    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await sql`
      INSERT INTO users (id, name, email, password_hash, role, is_active)
      VALUES (gen_random_uuid(), ${name}, ${email}, ${passwordHash}, 'user', true)
      RETURNING id, name, email, role, created_at
    `;
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password are required" });

  try {
    const [user] = await sql`
      SELECT id, name, email, role, password_hash, is_active
      FROM users WHERE email = ${email}
    `;
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    if (!user.is_active) return res.status(403).json({ error: "Account is deactivated" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    let query;
    if (search) {
      query = await sql`
        SELECT p.*, c.name as category_name, s.business_name as seller_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN sellers s ON p.seller_id = s.id
        WHERE p.title ILIKE ${"%" + search + "%"} OR p.description ILIKE ${"%" + search + "%"}
        ORDER BY p.created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
    } else if (category) {
      query = await sql`
        SELECT p.*, c.name as category_name, s.business_name as seller_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN sellers s ON p.seller_id = s.id
        WHERE c.slug = ${category}
        ORDER BY p.created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
    } else {
      query = await sql`
        SELECT p.*, c.name as category_name, s.business_name as seller_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN sellers s ON p.seller_id = s.id
        ORDER BY p.created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
    }
    res.json({ count: query.length, products: query });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    const [product] = await sql`
      SELECT p.*, c.name as category_name, s.business_name as seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sellers s ON p.seller_id = s.id
      WHERE p.slug = ${req.params.slug}
    `;
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CATEGORIES ───────────────────────────────────────────────────────────────
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name`;
    res.json({ count: categories.length, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SELLERS ──────────────────────────────────────────────────────────────────
app.get("/api/sellers", async (req, res) => {
  try {
    const sellers = await sql`
      SELECT s.*, u.name as owner_name, u.email as owner_email
      FROM sellers s LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `;
    res.json({ count: sellers.length, sellers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/sellers/:id", async (req, res) => {
  try {
    const [seller] = await sql`
      SELECT s.*, u.name as owner_name, u.email as owner_email
      FROM sellers s LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ${req.params.id}
    `;
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ORDERS ───────────────────────────────────────────────────────────────────
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await sql`
      SELECT o.*, u.name as buyer_name, u.email as buyer_email,
             s.business_name as seller_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN sellers s ON o.seller_id = s.id
      ORDER BY o.created_at DESC LIMIT 50
    `;
    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── STATS ─────────────────────────────────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  try {
    const [[users], [products], [sellers], [orders]] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM products`,
      sql`SELECT COUNT(*) as count FROM sellers`,
      sql`SELECT COUNT(*) as count FROM orders`,
    ]);
    res.json({
      totalUsers: Number(users.count),
      totalProducts: Number(products.count),
      totalSellers: Number(sellers.count),
      totalOrders: Number(orders.count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.BACKEND_PORT || 8000;
app.listen(PORT, () => {
  console.log(`\n🚀 Andromeda Backend API running at http://localhost:${PORT}`);
  console.log(`📋 API Docs:     http://localhost:${PORT}/`);
  console.log(`❤️  Health:       http://localhost:${PORT}/api/health`);
  console.log(`👤 Users:        http://localhost:${PORT}/api/users`);
  console.log(`📦 Products:     http://localhost:${PORT}/api/products`);
  console.log(`🗂️  Categories:   http://localhost:${PORT}/api/categories`);
  console.log(`🏪 Sellers:      http://localhost:${PORT}/api/sellers`);
  console.log(`📊 Stats:        http://localhost:${PORT}/api/stats\n`);
});
